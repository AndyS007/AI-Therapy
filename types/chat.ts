import { OpenAIModel, OpenAIModelID } from '@/types/openai'
import { SESSIONS } from '@/types/prompt'

export interface Message {
  role: Role
  content: string
  session?: SESSIONS
}

export interface ChatBody {
  model: OpenAIModelID
  messages: Message[]
  // key: string
  prompt?: string
  session: SESSIONS
  // temperature: number
}

export type Role = 'assistant' | 'user'

export const defaultConversation = {
  id: 1,
  name: '',
  messages: [],
  session: SESSIONS.START,
  sessionEnded: false,
}

export interface Conversation {
  id: number
  name: string
  messages: Message[]
  session?: SESSIONS
  sessionEnded?: boolean
  model?: OpenAIModel
  // prompt: string
  // temperature: number
  // folderId: string | null
}
