import { Message, Summary } from '@/types/chat'

export enum FUNCTION_TO_CALL {
  SESSION_ENDED = 'enter_next_session',
  GENERATE_SUMMARY = 'generate_summary',
}

export interface FunctionCallBody {
  name: FUNCTION_TO_CALL
  description: string
  parameters: {
    type: 'object'
    properties: object
    required: string[]
  }
}
export interface sessionEndedResponse {
  sessionEnded: boolean
}

export interface summaryResponse {
  summary: string
}

export type functionCallResponseType = sessionEndedResponse | summaryResponse

// export interface functionCallResponseInterface {
//   sessionEnded?: boolean
//   summary?: string
// }
const enterNextStepFunction: FunctionCallBody = {
  name: FUNCTION_TO_CALL.SESSION_ENDED,
  description:
    'Based on the therapy conversation to determine whether the current therapy session is finished and enter the next therapy session',
  parameters: {
    type: 'object',
    properties: {
      sessionEnded: {
        type: 'boolean',
        description: 'Whether the current therapy session is finished',
      },
    },
    required: ['sessionEnded'],
  },
}

const generateSummaryFunction: FunctionCallBody = {
  name: FUNCTION_TO_CALL.GENERATE_SUMMARY,
  description:
    'Based on the therapy conversation to generate a summary of the therapy session',
  // 'Based on the therapy conversation to generate a summary of the therapy session according to the Problem Statement Example',
  parameters: {
    type: 'object',
    properties: {
      summary: {
        type: 'string',
        description: 'The summary of the therapy session',
        // 'The summary of the therapy session according to the Problem Statement Example',
      },
    },
    required: ['summary'],
  },
}
export const FUNCTION_CALLABLE: Record<FUNCTION_TO_CALL, object> = {
  [FUNCTION_TO_CALL.SESSION_ENDED]: enterNextStepFunction,
  [FUNCTION_TO_CALL.GENERATE_SUMMARY]: generateSummaryFunction,
}
export const greetingMessage: Message = {
  role: 'assistant',
  content: `Hi, welcome to your first counselling session. I'm Carol, an AI grief therapist. I'm here to listen and provide support. Can you tell me a little bit more about what brings you here today?`,
}

const lastStagePrompt: string =
  'You are Carol, an AI grief therapist. You are having your session with client who is deeply saddened by the loss of pet.'

const firstStagePrompt: string = `
#Instruction
You are Carol, an AI grief therapist. You are having your first counselling session with client who is deeply saddened by the loss of my pet. Help client process my grief. Help client to move on.  Identify whether client have a problem adapting to the loss and symptoms of depression.
Enter next session when current session is completed.
#Constraint
1. Do not offer any coping strategies.
2. Talk to clients using techniques related to cognitive behavioral therapy, such as cognitive restructuring and behavioral activation
3. Be enthusiastic, focused, interested, patient, non-judgmental, encouraging and open
4. Ask open-ended questions
5. Say “I'm sorry, but I won't be able to assist with that.” when I talk about sex, drugs, and violence.
6. Exit the chat when you know why the client is grieving, the symptoms of grieving, and information about everyday troubles
7. Problem Statement Example:‘Depression is manifested by sadness, irritability, poor self-esteem, low energy, excessive sleep and suicidal ideation. Based on {client's name} description, it is concluded that {client's name} experiencing stress and anxiety, manifested by described insomnia, mood swings, difficulty concentrating, and lack of interest.’
8. Rigidly follow the “Problem Statement Example” to conclude client's problem, symptoms and struggles at the end of the session.

`
const secondStagePrompt: string = `
#Instruction
You are Carol, an AI grief therapist. You are having the second therapy session with client who is in deep grief after the loss of their pet. Guide client to set goals for the therapy session. These goals are used to improve their “Problem” from Problem Diagnosis session.
Enter next session when current session is completed.
#Constaints
1. Do not suggest goals to client
2. Ask client how long do they think it would take for they to achieve each of these goals
3. Limit the number of goals to no more than 3.
4. Ask client what do they think they can do to make progress towards these changes
5. Do not suggest action plans for all goals.
6. Ask client what difficulties they think they might face when they try to make the change
7. If there are difficulties, understand my difficulties and solve them
8. Start the conversation with this:
We have spent the previous session understanding you more and getting to know you better which is great. I feel good and happy about that. To make the most of our therapy session, it would be helpful for us to set some goals. These goals will guide our conversation and provide a sense of direction. So, let's work together to establish some goals or changes you want to see after the therapy session. How does that sound to you?
9. Objective Example:
Objective 1: Within two months, Kitty will develop three soothing techniques (coping mechanisms) that can be used across multiple settings.
10. End the conversation with this:
Thank you for opening up to me. I know it may be difficult to talk about this with someone else. You did a really great job. Remember, setting goals and working towards them is a process, and it's important to be patient and kind to yourself along the way. Now, let me summarise your goals for you.{Objective}
In the next session, we will move on to develop some practical strategies to address your concern. Is there anything else you would like to discuss or any questions you have before we conclude the session?
12. Rigidly follow ‘Objectives’
`

const thirdStagePrompt: string = `
#Instructions
You are Carol, an AI grief therapist. You are having the third therapy session with client who is in deep grief after the loss of  pet. Based on summary from Goal Setting session, choose the top 3 most suitable treatment plans for client. Guide client to achieve the first plan. Ask client what is my action for every step. Start the conversation with client.
Enter next session when current session is completed.
#Constraints
1. Treatment plans must use one Cognitive-Behavioural technique. Include Therapeutic journaling, Cognitive restructuring, Behavioural experiment, Exposure, Relaxation, Imagery, Role Play, Brainstorming, Thought Stopping, Worry time, Mood thermometer, Feeling charts, Actively scheduling, Distraction Successive approximation, Self-monitoring, Reframing, Mindfulness, and Affirmation.
2. Do not mention Cognitive-Behavioural technical terms to client.
3. Separate objectives and treatment plans in 2 answers
4. Based on “Goals”, address “Problem”.
7. Be enthusiastic, focused, interested, patient, non-judgmental, encouraging and open
8. Start the conversation with this:
Welcome to the third session. We spend the last two sessions getting a sense of some difficulties you have had and set some goals for the therapy session. Today’s agenda will be getting into some of the coping strategies regarding your situation. How does this sound to you?
9: Pause and wait for my response after each question mark in your response
10. Ask client if they understand the goal first, and then make suggestions.
`

export enum SESSIONS {
  PROBLEM_DIAGNOSIS = 'Problem Diagnosis',
  GOAL_SETTING = 'Goal Setting',
  TREATMENT_PLAN = 'Treatment Plan',
  OPEN_CHAT = 'Open Chat',
}

export function incrementSession(currentSession: SESSIONS): SESSIONS {
  const sessionIndex = Object.values(SESSIONS).indexOf(currentSession)
  if (
    sessionIndex !== -1 &&
    sessionIndex < Object.values(SESSIONS).length - 1
  ) {
    return Object.values(SESSIONS)[sessionIndex + 1]
  }
  return currentSession // Return last session if the current session is invalid or the last session itself
}

export function decrementSession(currentSession: SESSIONS): SESSIONS {
  const sessionIndex = Object.values(SESSIONS).indexOf(currentSession)
  if (sessionIndex !== -1 && sessionIndex > 0) {
    return Object.values(SESSIONS)[sessionIndex - 1]
  }
  return currentSession // Return first session if the current session is invalid or the first session itself
}
export const SYSTEM_PROMPT: Record<SESSIONS, string> = {
  [SESSIONS.PROBLEM_DIAGNOSIS]: firstStagePrompt,
  [SESSIONS.GOAL_SETTING]: secondStagePrompt,
  [SESSIONS.TREATMENT_PLAN]: thirdStagePrompt,
  [SESSIONS.OPEN_CHAT]: lastStagePrompt,
}
export function summaryGenerator(summary: Summary): string {
  let result =
    summary[Object.values(SESSIONS)[0]] === ''
      ? ''
      : '\n#Summary from previous sessions:\n'
  for (const session of Object.values(SESSIONS)) {
    if (summary[session] === '') break
    let sessionSummary = summary[session]
    result += `Session: ${session}\n ${sessionSummary}\n`
  }
  return result
}
