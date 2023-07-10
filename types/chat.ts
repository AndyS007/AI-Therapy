import { OpenAIModel } from '@/types/openai'

export interface Message {
  role: Role
  content: string
}

export interface ChatBody {
  model: OpenAIModel
  messages: Message[]
  // key: string
  prompt: string
  stage: number
  // temperature: number
}
export interface Message {
  role: Role
  content: string
}

export type Role = 'assistant' | 'user'

export const defaultConversation = {
  id: 1,
  name: '',
  messages: [],
  stage: 1,
  sessionEnded: false,
}

export interface Conversation {
  id: number
  name: string
  messages: Message[]
  stage: number
  sessionEnded?: boolean
  model?: OpenAIModel
  // prompt: string
  // temperature: number
  // folderId: string | null
}
