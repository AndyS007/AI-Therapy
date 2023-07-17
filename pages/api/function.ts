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
    // console.log('messagesToSend', messagesToSend)

    const sessionEndedPromise = functionCallResponse(
      model,
      messagesToSend,
      promptToSend,
      FUNCTION_TO_CALL.SESSION_ENDED,
    )
    const summaryPromise = functionCallResponse(
      model,
      messagesToSend,
      promptToSend,
      FUNCTION_TO_CALL.GENERATE_SUMMARY,
    )
    const raceResult = (await (
      await Promise.race([sessionEndedPromise, summaryPromise])
    ).json()) as functionCallResponseType
    // console.log('raceResult', raceResult)

    if ('sessionEnded' in raceResult) {
      // console.log('session promise won')
      if (!raceResult.sessionEnded) {
        // console.log('session not ended')
        return new Response(
          JSON.stringify({ sessionEnded: false, summary: '' }),
        )
      } else {
        // console.log('session ended, waiting for summary')
        const { summary } = (await (
          await summaryPromise
        ).json()) as summaryResponse
        // console.log('summary', summary)
        return new Response(JSON.stringify({ sessionEnded: true, summary }))
      }
    } else {
      // console.log('summary promise won, check if session ended')
      const { sessionEnded } = (await (
        await sessionEndedPromise
      ).json()) as sessionEndedResponse

      // console.log('sessionEnded', sessionEnded)
      return new Response(
        JSON.stringify({
          sessionEnded,
          summary: sessionEnded ? raceResult.summary : '',
        }),
      )
    }
  } catch (error) {
    console.error(error)
    return new Response('Error', { status: 500 })
  }
}

export default handler
