import { Conversation } from '@/types/chat'
import { IconMessage, IconTrash } from '@tabler/icons-react'
import { FC } from 'react'
import { SESSIONS } from '@/types/prompt'

interface Props {
  conversations: Conversation[]
  selectedConversation: Conversation
  onSelectConversation: (conversation: Conversation) => void
  onDeleteConversation: (conversation: Conversation) => void
}

export const Conversations: FC<Props> = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  onDeleteConversation,
}) => {
  return (
    <div className="flex flex-col space-y-2">
      {conversations.map((conversation, index) => (
        <div
          key={index}
          className={`flex items-center justify-start w-[240px] h-[40px] px-2 text-sm rounded-lg hover:bg-neutral-700 cursor-pointer ${
            selectedConversation.id === conversation.id ? 'bg-slate-600' : ''
          }`}
          onClick={() => onSelectConversation(conversation)}
        >
          <IconMessage className="mr-2 min-w-[20px]" size={18} />
          <div className="overflow-hidden whitespace-nowrap overflow-ellipsis pr-1">
            {conversation.messages[SESSIONS.PROBLEM_DIAGNOSIS][0]
              ? conversation.messages[SESSIONS.PROBLEM_DIAGNOSIS][0].content
              : 'Empty conversation'}
          </div>

          <IconTrash
            className="ml-auto min-w-[20px] text-neutral-400 hover:text-neutral-100"
            size={18}
            onClick={(e) => {
              e.stopPropagation()
              onDeleteConversation(conversation)
            }}
          />
        </div>
      ))}
    </div>
  )
}
