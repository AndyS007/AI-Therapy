import { useAuth } from '@/components/AuthProvider'
import { Chat } from '@/components/Chat/Chat'
import { Sidebar } from '@/components/Sidebar/Sidebar'
import { collection, addDoc, setDoc, doc, getDoc } from 'firebase/firestore'

import {
  Conversation,
  Message,
  defaultConversation,
  ChatBody,
} from '@/types/chat'
import { OpenAIModelID } from '@/types/openai'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { greetingMessage, incrementSession, SESSIONS } from '@/types/prompt'
import { db } from '@lib/firebase'

export default function Home() {
  const router = useRouter()
  const { currentUser } = useAuth()
  useEffect(() => {
    if (!currentUser) {
      router.replace('/login')
    }
  }, [currentUser, router])

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation>()
  const [loading, setLoading] = useState<boolean>(false)
  const [model, setModel] = useState<OpenAIModelID>(OpenAIModelID.GPT_3_5_16K)
  const [lightMode, setLightMode] = useState<'dark' | 'light'>('dark')
  const [showSidebar, setShowSidebar] = useState<boolean>(true)
  const handleSend = useCallback(
    async (message: Message | null) => {
      if (selectedConversation) {
        let updatedConversation: Conversation =
          message === null
            ? selectedConversation
            : {
                ...selectedConversation,
                // messages: [...selectedConversation.messages, message],
                messages: {
                  ...selectedConversation.messages,
                  [selectedConversation.currentSession]: [
                    ...selectedConversation.messages[
                      selectedConversation.currentSession
                    ],
                    message,
                  ],
                },
              }

        setSelectedConversation(updatedConversation)
        setLoading(true)

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages:
              updatedConversation.messages[updatedConversation.currentSession],
            session: updatedConversation.currentSession,
            summary: updatedConversation.summary,
          } as ChatBody),
        })

        if (!response.ok) {
          setLoading(false)
          throw new Error(response.statusText)
        }

        const data = response.body

        if (!data) {
          return
        }

        setLoading(false)

        const reader = data.getReader()
        const decoder = new TextDecoder()
        let done = false
        let isFirst = true
        let text = ''

        while (!done) {
          const { value, done: doneReading } = await reader.read()
          done = doneReading
          const chunkValue = decoder.decode(value)
          let updatedMessages: Message[]

          text += chunkValue

          if (isFirst) {
            isFirst = false
            updatedMessages = [
              ...updatedConversation.messages[
                updatedConversation.currentSession
              ],
              { role: 'assistant', content: chunkValue },
            ]
          } else {
            updatedMessages = updatedConversation.messages[
              updatedConversation.currentSession
            ].map((message, index) => {
              if (
                index ===
                updatedConversation.messages[updatedConversation.currentSession]
                  .length -
                  1
              ) {
                return {
                  ...message,
                  content: text,
                }
              }

              return message
            })
          }
          updatedConversation = {
            ...updatedConversation,
            messages: {
              ...selectedConversation.messages,
              [selectedConversation.currentSession]: updatedMessages,
            },
          }

          setSelectedConversation(updatedConversation)
        }

        const functionCallRes = await fetch('/api/function', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages:
              updatedConversation.messages[updatedConversation.currentSession],
            session: updatedConversation.currentSession,
            summary: updatedConversation.summary,
          } as ChatBody),
        })

        const { sessionEnded, summary } = await functionCallRes.json()
        console.log('sessionEnded: ', sessionEnded)
        console.log('summary: ', summary)
        alert('Session Ended: ' + sessionEnded)
        if (sessionEnded) {
          const nextSession = incrementSession(
            updatedConversation.currentSession,
          )
          alert('Session Summary: ' + summary)
          updatedConversation = {
            ...updatedConversation,
            currentSession: nextSession,
            summary: {
              ...updatedConversation.summary,
              [updatedConversation.currentSession]: summary,
            },
          }
          setSelectedConversation(updatedConversation)
        }

        // localStorage.setItem(
        //   'selectedConversation',
        //   JSON.stringify(updatedConversation),
        // )

        const conversationRef = doc(db, 'therapy', currentUser!.uid)
        await setDoc(conversationRef, updatedConversation)

        const updatedConversations: Conversation[] = conversations.map(
          (conversation) => {
            if (conversation.id === selectedConversation.id) {
              return updatedConversation
            }

            return conversation
          },
        )

        if (updatedConversations.length === 0) {
          updatedConversations.push(updatedConversation)
        }

        setConversations(updatedConversations)

        localStorage.setItem(
          'conversationHistory',
          JSON.stringify(updatedConversations),
        )
      }
    },
    [conversations, model, selectedConversation, currentUser],
  )

  const handleLightMode = (mode: 'dark' | 'light') => {
    setLightMode(mode)
    localStorage.setItem('theme', mode)
  }

  const handleNewConversation = async () => {
    let newConversation: Conversation = {
      ...defaultConversation,
      id: conversations.length + 1,
    }

    setSelectedConversation(newConversation)
    let updatedConversations = [...conversations, newConversation]
    setConversations(updatedConversations)

    localStorage.setItem(
      'selectedConversation',
      JSON.stringify(newConversation),
    )

    localStorage.setItem(
      'conversationHistory',
      JSON.stringify(updatedConversations),
    )

    setModel(OpenAIModelID.GPT_3_5_16K)
    setLoading(false)
  }

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    localStorage.setItem('selectedConversation', JSON.stringify(conversation))
  }

  const handleDeleteConversation = (conversation: Conversation) => {
    const updatedConversations = conversations.filter(
      (c) => c.id !== conversation.id,
    )
    setConversations(updatedConversations)
    localStorage.setItem(
      'conversationHistory',
      JSON.stringify(updatedConversations),
    )

    if (updatedConversations.length > 0) {
      setSelectedConversation(updatedConversations[0])
      localStorage.setItem(
        'selectedConversation',
        JSON.stringify(updatedConversations[0]),
      )
    } else {
      setSelectedConversation(defaultConversation)
      localStorage.removeItem('selectedConversation')
    }
  }

  async function performGreetingAnimation(newConversation: Conversation) {
    let isFirst = true
    const words = greetingMessage.content.split(/\s+/)
    let text = ''
    let updatedMessages: Message[]

    if (newConversation) {
      for (let i = 0; i < words.length; i++) {
        const chunkValue = words[i] + ' '
        text += chunkValue
        if (isFirst) {
          isFirst = false
          updatedMessages = [
            ...newConversation.messages[newConversation.currentSession],
            { role: 'assistant', content: chunkValue },
          ]
        } else {
          updatedMessages = newConversation.messages[
            newConversation.currentSession
          ].map((message, index) => {
            if (
              index ===
              newConversation.messages[newConversation.currentSession].length -
                1
            ) {
              return {
                ...message,
                content: text,
              }
            }

            return message
          })
        }
        newConversation = {
          ...newConversation,
          messages: {
            ...newConversation.messages,
            [newConversation.currentSession]: updatedMessages,
          },
        }

        setSelectedConversation(newConversation)

        await new Promise((resolve) => setTimeout(resolve, 50)) // Add a delay of 500 milliseconds
      }
    }
    return newConversation
  }
  useEffect(() => {
    const theme = localStorage.getItem('theme')
    if (theme) {
      setLightMode(theme as 'dark' | 'light')
    }

    const conversationHistory = localStorage.getItem('conversationHistory')

    if (conversationHistory) {
      setConversations(JSON.parse(conversationHistory))
    }

    // const selectedConversation = localStorage.getItem('selectedConversation')
    let selectedConversation
    if (currentUser === null) {
      console.log('currentUser is null')
    }
    getDoc(doc(db, 'therapy', currentUser!.uid)).then((docSnap) => {
      if (docSnap.exists()) {
        selectedConversation = docSnap.data() as Conversation
        console.log('Document data:', docSnap.data())
        if (selectedConversation) {
          setSelectedConversation(selectedConversation)
        } else {
          setSelectedConversation(defaultConversation)
        }
      } else {
        // doc.data() will be undefined in this case
        console.log('No such document!')
      }
    })
  }, [currentUser])

  useEffect(() => {
    if (
      selectedConversation?.messages[SESSIONS.PROBLEM_DIAGNOSIS].length === 0
    ) {
      handleSend(null)
    }
  }, [selectedConversation, conversations, handleSend])

  useEffect(() => {
    function handleWindowResize() {
      if (window.innerWidth < 640) {
        setShowSidebar(false)
      } else {
        setShowSidebar(true)
      }
    }

    // Call the handler once to set the initial value
    handleWindowResize()

    // Add event listener for window resize
    window.addEventListener('resize', handleWindowResize)

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('resize', handleWindowResize)
    }
  }, [])

  return (
    <>
      <Head>
        <title>AI Therapy</title>
        <meta name="description" content="An AI Therapist powered by OpenAI" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {selectedConversation && (
        <div className={`flex h-screen text-white ${lightMode}`}>
          {showSidebar && (
            <Sidebar
              conversations={conversations}
              lightMode={lightMode}
              selectedConversation={selectedConversation}
              onToggleLightMode={handleLightMode}
              onNewConversation={handleNewConversation}
              onSelectConversation={handleSelectConversation}
              onDeleteConversation={handleDeleteConversation}
            />
          )}

          <div className="flex flex-col w-full h-full dark:bg-[#343541] overflow-x-hidden">
            <Chat
              model={model}
              // the whole conversation history
              messages={Object.values(selectedConversation.messages).reduce(
                (accumulator, currentValue) => {
                  return accumulator.concat(currentValue)
                },
                [],
              )}
              session={selectedConversation.currentSession}
              loading={loading}
              onSend={handleSend}
              onSelect={setModel}
            />
          </div>
        </div>
      )}
    </>
  )
}
