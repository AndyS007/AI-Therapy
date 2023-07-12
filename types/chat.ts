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
  prompt?: string
  session: SESSIONS
}

export type Role = 'assistant' | 'user'

const defaultSummary = {
  [SESSIONS.START]: '',
  [SESSIONS.GOAL_SETTING]: '',
  [SESSIONS.TREATMENT_PLAN]: '',
  [SESSIONS.OPEN_CHAT]: '',
}

export const defaultConversation = {
  id: 1,
  name: '',
  messages: {
    [SESSIONS.START]: [],
    [SESSIONS.GOAL_SETTING]: [],
    [SESSIONS.TREATMENT_PLAN]: [],
    [SESSIONS.OPEN_CHAT]: [],
  },
  currentSession: SESSIONS.START,
  summary: defaultSummary,
}

export interface Conversation {
  id: number
  name: string
  // messages: Message[]
  messages: {
    [key in SESSIONS]: Message[]
  }
  currentSession: SESSIONS
  model?: OpenAIModel
  summary: {
    [key in SESSIONS]: string
  }
  // temperature: number
  // folderId: string | null
}

export interface SessionSummary {}
