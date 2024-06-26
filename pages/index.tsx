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
import { incrementSession, SESSIONS } from '@/types/prompt'
import { db } from '@lib/firebase'

export default function Home() {
  const router = useRouter()
  const { currentUser } = useAuth()
  useEffect(() => {
    if (!currentUser) {
      router.replace('/login')
    }
  }, [currentUser, router])

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

        //TODO: save to firestore and local storage if logged in, save to local storage if not
        const conversationRef = doc(db, 'therapy', currentUser!.uid)
        await setDoc(conversationRef, updatedConversation)
      }
    },
    [model, selectedConversation, currentUser],
  )

  const handleLightMode = (mode: 'dark' | 'light') => {
    setLightMode(mode)
    localStorage.setItem('theme', mode)
  }

  const handleRestartConversation = async () => {
    let newConversation: Conversation = {
      ...defaultConversation,
    }

    setSelectedConversation(newConversation)
  }

  useEffect(() => {
    const theme = localStorage.getItem('theme')
    if (theme) {
      setLightMode(theme as 'dark' | 'light')
    }

    // const selectedConversation = localStorage.getItem('selectedConversation')
    let selectedConversation
    if (currentUser === null) {
      console.log('currentUser is null')
    } else {
      getDoc(doc(db, 'therapy', currentUser.uid)).then((docSnap) => {
        if (docSnap.exists()) {
          selectedConversation = docSnap.data() as Conversation
          console.log('Document data:', docSnap.data())
          setSelectedConversation(selectedConversation)
        } else {
          // doc.data() will be undefined in this case
          console.log('No document found! Creating new conversation')
          setSelectedConversation(defaultConversation)
        }
      })
    }
  }, [currentUser])

  useEffect(() => {
    if (
      selectedConversation?.messages[SESSIONS.PROBLEM_DIAGNOSIS].length === 0
    ) {
      handleSend(null)
    }
  }, [selectedConversation, handleSend])

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
          {/*<Sidebar lightMode={lightMode} onToggleLightMode={handleLightMode} />*/}

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
              onRestart={handleRestartConversation}
            />
          </div>
        </div>
      )}
    </>
  )
}
