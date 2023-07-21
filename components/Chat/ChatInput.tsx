import { Message } from '@/types/chat'
import { IconRepeat, IconSend } from '@tabler/icons-react'
import React, { FC, KeyboardEvent, useEffect, useRef, useState } from 'react'

interface Props {
  onSend: (message: Message) => void
  onRestart: () => void
}

export const ChatInput: FC<Props> = ({ onSend, onRestart }) => {
  const [content, setContent] = useState<string>()

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length > 4000) {
      alert('Message limit is 4000 characters')
      return
    }

    setContent(value)
  }

  const handleSend = () => {
    if (!content) {
      alert('Please enter a message')
      return
    }
    onSend({ role: 'user', content })
    setContent('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  useEffect(() => {
    if (textareaRef && textareaRef.current) {
      textareaRef.current.style.height = 'inherit'
      textareaRef.current.style.height = `${textareaRef.current?.scrollHeight}px`
      textareaRef.current.style.overflow = `${
        textareaRef?.current?.scrollHeight > 400 ? 'auto' : 'hidden'
      }`
    }
  }, [content])

  return (
    <div className="relative">
      <div className="absolute bottom-[-120px] w-full">
        <textarea
          ref={textareaRef}
          className="rounded-lg pl-4 pr-8 py-3 w-full focus:outline-none max-h-[280px] dark:bg-[#40414F] dark:border-opacity-50 dark:border-neutral-800 dark:text-neutral-100 border border-neutral-300 shadow text-neutral-900"
          style={{
            resize: 'none',
            bottom: `${textareaRef?.current?.scrollHeight}px`,
            maxHeight: '400px',
            overflow: `${
              textareaRef.current && textareaRef.current.scrollHeight > 400
                ? 'auto'
                : 'hidden'
            }`,
          }}
          placeholder="Type a message..."
          value={content}
          rows={1}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />

        <button
          className="absolute bottom-20 left-0 right-0 mx-auto mb-3 flex w-fit items-center gap-3 rounded border border-neutral-200 bg-white py-2 px-4 text-black hover:opacity-50 dark:border-neutral-600 dark:bg-[#343541] dark:text-white md:mb-0 md:mt-2"
          onClick={onRestart}
        >
          <IconRepeat size={18} />
          {'Restart'}
        </button>
        <button
          className="absolute right-2 bottom-[14px] text-neutral-400 p-2 hover:dark:bg-neutral-800 hover:bg-neutral-400 hover:text-white rounded-md"
          onClick={handleSend}
        >
          <IconSend size={18} />
        </button>
      </div>
    </div>
  )
}
