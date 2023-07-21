import { Message } from '@/types/chat'
import { OpenAIModelID } from '@/types/openai'
import React, { FC, useEffect, useRef } from 'react'
import { ChatInput } from './ChatInput'
import { ChatLoader } from './ChatLoader'
import { ChatMessage } from './ChatMessage'
import { SESSIONS } from '@/types/prompt'

interface Props {
  model: OpenAIModelID
  session?: SESSIONS
  messages: Message[]
  loading: boolean
  onSend: (message: Message) => void
  onSelect: (model: OpenAIModelID) => void
  onRestart: () => void
}

export const Chat: FC<Props> = ({
  model,
  session,
  messages,
  loading,
  onSend,
  onSelect,
  onRestart,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="h-full flex flex-col">
      {
        <>
          <div className="flex-1 overflow-auto ">
            <div className="sticky  top-0  flex justify-center bg-neutral-100   py-3 dark:bg-[#434654] dark:text-neutral-300 text-neutral-500 text-sm border border-b-neutral-300 dark:border-none">
              {/*Model: {OpenAIModelNames[model]}*/}
              Current Session: {session}
            </div>

            {messages.map((message, index) => (
              <div key={index}>
                <ChatMessage message={message} />
              </div>
            ))}
            {loading && <ChatLoader />}
            <div ref={messagesEndRef} />
          </div>
        </>
      }

      <div className="h-[140px] w-[800px] mx-auto">
        <ChatInput onSend={onSend} onRestart={onRestart} />
      </div>
    </div>
  )
}
