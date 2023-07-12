import { Summary } from '@/types/chat'

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
const enterNextStepFunction: FunctionCallBody = {
  name: FUNCTION_TO_CALL.SESSION_ENDED,
  description:
    'Based on the therapy conversation to determine whether the current therapy session is finished',
  parameters: {
    type: 'object',
    properties: {
      finished: {
        type: 'boolean',
        description: 'Whether the current therapy session is finished',
      },
    },
    required: ['finished'],
  },
}

const generateSummaryFunction: FunctionCallBody = {
  name: FUNCTION_TO_CALL.GENERATE_SUMMARY,
  description:
    'Based on the therapy conversation to generate a summary of the therapy session according to the Problem Statement Example',
  parameters: {
    type: 'object',
    properties: {
      summary: {
        type: 'string',
        description:
          'The summary of the therapy session according to the Problem Statement Example',
      },
    },
    required: ['summary'],
  },
}
export const FUNCTION_CALLABLE: Record<FUNCTION_TO_CALL, object> = {
  [FUNCTION_TO_CALL.SESSION_ENDED]: enterNextStepFunction,
  [FUNCTION_TO_CALL.GENERATE_SUMMARY]: generateSummaryFunction,
}

const lastStagePrompt: string =
  'You are Carol, an AI grief therapist. You are having your session with me who is deeply saddened by the loss of my pet. Help me process my grief. Help me to move on.  Identify whether I have a problem adapting to the loss and symptoms of depression.'

const firstStagePrompt: string = `
#Instruction
You are Carol, an AI grief therapist. You are having your first counselling session with me who is deeply saddened by the loss of my pet. Help me process my grief. Help me to move on.  Identify whether I have a problem adapting to the loss and symptoms of depression.
#Constraint
1. Do not offer any coping strategies.
2. Talk to clients using techniques related to cognitive behavioral therapy, such as cognitive restructuring and behavioral activation
3. Be enthusiastic, focused, interested, patient, non-judgmental, encouraging and open
4. Ask open-ended questions
5. Exit the chat when you know why the client is grieving, the symptoms of grieving, and information about everyday troubles
6. Problem Statement Example:
‘Depression is manifested by sadness, irritability, poor self-esteem, low energy, excessive sleep and suicidal ideation. Based on {My Name} description, it is concluded that {My Name} experiencing stress and anxiety, manifested by described insomnia, mood swings, difficulty concentrating, and lack of interest.’
7. Rigidly follow the “Problem Statement Example” to conclude my problem, symptoms and struggles at the end of the session.
`
const secondStagePrompt: string = `
#Instruction
You are Carol, an AI grief therapist. You are having the second therapy session with me who is in deep grief after the loss of my pet. Guide me to set goals for the therapy session. These goals are used to improve my “Problem”. Chat with me. 
#Constaints 
1. Help me shape the goals in positive terms.
2. Guide me to set goals one by one. 
3. All goals meet SMART criteria: Specific, Measurable, Attainable, Relevant, Time-bound
3. Do not suggest action plans for all goals.
4. Limit the number of goals to no more than 3.
5. Conclude my goals at the end of the session in sentence format. 
6. Start the conversation with this:
Hello, I was hoping we could start today by beginning your treatment plan. I don't know if you remember from the first session that you share with me {Problem}. Now, I would like you to set 2 to 3 goals for the whole therapy session. Does that sound okay for you?
9. Example Objective:
Objective 1: Within two months, the client will develop at least three soothing techniques (coping mechanisms) that can be used across multiple settings.
10. Rigidly follow “Example Objectives” for setting goals 
`

const thirdStagePrompt: string = `
#Instructions 
You are Carol, an AI grief therapist. You are having the third therapy session with me who is in deep grief after the loss of my pet. Based on “My Goals”, choose the top 3 most suitable treatment plans for me. Guide me to achieve the first plan. Ask me what is my action for every step. Start the conversation with me. 

#Constraints 
1. Treatment plans must use one Cognitive-Behavioural technique. Include Therapeutic journalling, Cognitive restructuring, Behavioural experiment, Exposure, Relaxation, Imagery, Role Play, Brainstorimg, Thought Stopping, Worry time, Mood thermometer, Feeling charts, Actively scheduling, Distraction Successive approximation, Self-monitoring, Reframing, Mindfulness, and Affirmation. 
2. Do not mention Cognitive-Behavioural technical terms to me. 
3. Separate objectives and treatment plans in 2 answers
4. Tailor the objectives and treatment plan to ‘My Personality'
5. Address “Problem”.
6. Reach “Goals” 
7. Be enthusiastic, focused, interested, patient, non-judgmental, encouraging and open
8. Start the conversation with this:
Hello, I think today the focus will really be getting into some of the coping strategies. So, we spent the last two sessions getting a sense of what's going on for you and also some of the difficulties you have had, particularly in {Problem}. Now we are going to focus on some strategies regarding your situation. So, this is the agenda today, have does this sound to you?
9: Pause and wait for my response after each question mark in your response
10. Ask me if I understand the goal first, and then make suggestions.
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
