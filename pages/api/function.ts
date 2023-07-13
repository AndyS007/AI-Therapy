import { ChatBody } from '@/types/chat'
import {
  FUNCTION_TO_CALL,
  functionCallResponseType,
  sessionEndedResponse,
  summaryGenerator,
  summaryResponse,
  SYSTEM_PROMPT,
} from '@/types/prompt'
import { functionCallResponse, extractMessages } from '@/utils'
import { func } from 'prop-types'

const name = '/api/function'

export const config = {
  runtime: 'edge',
}

const handler = async (req: Request): Promise<Response> => {
  try {
    const {
      model,
      messages,
      session,
      summary: previousSummary,
    } = (await req.json()) as ChatBody
    let summaryToSend = summaryGenerator(previousSummary)
    let promptToSend = SYSTEM_PROMPT[session] + summaryToSend

    // console.log('promptToSend', promptToSend)
    let messagesToSend = await extractMessages(messages, model, promptToSend)
    // console.log(name, ': messagesToSend', messagesToSend)

    const rawSessionEndedRes = await functionCallResponse(
      model,
      messagesToSend,
      promptToSend,
      FUNCTION_TO_CALL.SESSION_ENDED,
    )
    const { sessionEnded } =
      (await rawSessionEndedRes.json()) as sessionEndedResponse
    let newSummary = ''

    if (sessionEnded) {
      // generate summary if session ended
      const rawSummaryRes = await functionCallResponse(
        model,
        messagesToSend,
        promptToSend,
        FUNCTION_TO_CALL.GENERATE_SUMMARY,
      )
      const { summary } = (await rawSummaryRes.json()) as summaryResponse
      newSummary = summary
    }

    return new Response(JSON.stringify({ sessionEnded, summary: newSummary }))
  } catch (error) {
    console.error(error)
    return new Response('Error', { status: 500 })
  }
}

export default handler
