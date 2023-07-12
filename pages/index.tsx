import { useAuth } from '@/components/AuthProvider'
import { Chat } from '@/components/Chat/Chat'
import { Sidebar } from '@/components/Sidebar/Sidebar'
import {
  Conversation,
  Message,
  defaultConversation,
  ChatBody,
} from '@/types/chat'
import { OpenAIModelID } from '@/types/openai'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { incrementSession, SESSIONS } from '@/types/prompt'

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
  const handleSend = async (message: Message) => {
    if (selectedConversation) {
      let updatedConversation: Conversation = {
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

        text += chunkValue

        if (isFirst) {
          isFirst = false
          const updatedMessages: Message[] = [
            ...updatedConversation.messages[updatedConversation.currentSession],
            { role: 'assistant', content: chunkValue },
          ]

          updatedConversation = {
            ...updatedConversation,
            messages: {
              ...selectedConversation.messages,
              [selectedConversation.currentSession]: updatedMessages,
            },
          }

          setSelectedConversation(updatedConversation)
        } else {
          const updatedMessages: Message[] = updatedConversation.messages[
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

          updatedConversation = {
            ...updatedConversation,
            messages: {
              ...selectedConversation.messages,
              [selectedConversation.currentSession]: updatedMessages,
            },
          }

          setSelectedConversation(updatedConversation)
        }
      }

      const sessionEndedRes = await fetch('/api/sessionState', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages:
            updatedConversation.messages[updatedConversation.currentSession],
          session: updatedConversation.currentSession,
        } as ChatBody),
      })

      const functionCallRes = await sessionEndedRes.json()
      const functionCallArgs =
        functionCallRes.choices[0].message.function_call.arguments
      let sessionState: boolean = JSON.parse(functionCallArgs).finished
      alert('Session Ended: ' + sessionState)
      if (sessionState) {
        // updatedConversation = {
        //   ...updatedConversation,
        // }
        // setSelectedConversation(updatedConversation)
        const nextSession = incrementSession(updatedConversation.currentSession)
        const summaryRes = await fetch('/api/summary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages:
              updatedConversation.messages[updatedConversation.currentSession],
            session: updatedConversation.currentSession,
          } as ChatBody),
        })

        const summaryArgs = (await summaryRes.json()).choices[0].message
          .function_call.arguments
        let summary: string = JSON.parse(summaryArgs).summary
        console.log('sessionSummary', summary)
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

      console.log('session: ', selectedConversation.currentSession)
      console.log(
        'conversation session summary: ',
        selectedConversation.summary,
      )

      localStorage.setItem(
        'selectedConversation',
        JSON.stringify(updatedConversation),
      )

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
  }

  const handleLightMode = (mode: 'dark' | 'light') => {
    setLightMode(mode)
    localStorage.setItem('theme', mode)
  }

  const handleNewConversation = () => {
    const newConversation: Conversation = {
      // id: conversations.length + 1,
      // name: '',
      // messages: [],
      // stage: 1,
      ...defaultConversation,
      id: conversations.length + 1,
    }

    const updatedConversations = [...conversations, newConversation]
    setConversations(updatedConversations)
    localStorage.setItem(
      'conversationHistory',
      JSON.stringify(updatedConversations),
    )

    setSelectedConversation(newConversation)
    localStorage.setItem(
      'selectedConversation',
      JSON.stringify(newConversation),
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

  useEffect(() => {
    const theme = localStorage.getItem('theme')
    if (theme) {
      setLightMode(theme as 'dark' | 'light')
    }

    const conversationHistory = localStorage.getItem('conversationHistory')

    if (conversationHistory) {
      setConversations(JSON.parse(conversationHistory))
    }

    const selectedConversation = localStorage.getItem('selectedConversation')
    if (selectedConversation) {
      setSelectedConversation(JSON.parse(selectedConversation))
    } else {
      setSelectedConversation(defaultConversation)
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
          <Sidebar
            conversations={conversations}
            lightMode={lightMode}
            selectedConversation={selectedConversation}
            onToggleLightMode={handleLightMode}
            onNewConversation={handleNewConversation}
            onSelectConversation={handleSelectConversation}
            onDeleteConversation={handleDeleteConversation}
          />

          <div className="flex flex-col w-full h-full dark:bg-[#343541]">
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
