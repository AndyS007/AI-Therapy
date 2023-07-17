import { OpenAIModel, OpenAIModelID } from '@/types/openai'
import { greetingMessage, SESSIONS } from '@/types/prompt'

export interface Message {
  role: Role
  content: string
}

export interface ChatBody {
  model: OpenAIModelID
  messages: Message[]
  prompt?: string
  session: SESSIONS
  summary: Summary
}

export type Role = 'assistant' | 'user'

const defaultSummary: Summary = {
  [SESSIONS.PROBLEM_DIAGNOSIS]: '',
  [SESSIONS.GOAL_SETTING]: '',
  [SESSIONS.TREATMENT_PLAN]: '',
  [SESSIONS.OPEN_CHAT]: '',
}
export type Summary = {
  [key in SESSIONS]: string
}
export type sessionMessages = {
  [key in SESSIONS]: Message[]
}

export const defaultConversation = {
  id: 1,
  name: '',
  messages: {
    [SESSIONS.PROBLEM_DIAGNOSIS]: [greetingMessage],
    [SESSIONS.GOAL_SETTING]: [],
    [SESSIONS.TREATMENT_PLAN]: [],
    [SESSIONS.OPEN_CHAT]: [],
  },
  currentSession: SESSIONS.PROBLEM_DIAGNOSIS,
  summary: defaultSummary,
}

export interface Conversation {
  id: number
  name: string
  messages: sessionMessages
  currentSession: SESSIONS
  model?: OpenAIModel
  summary: Summary
}
