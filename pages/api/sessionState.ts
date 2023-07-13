import { ChatBody } from '@/types/chat'
import {
  FUNCTION_TO_CALL,
  summaryGenerator,
  SYSTEM_PROMPT,
} from '@/types/prompt'
import { functionCallResponse, extractMessages } from '@/utils'

const name = '/api/sessionState'

export const config = {
  runtime: 'edge',
}

const handler = async (req: Request): Promise<Response> => {
  try {
    const { model, messages, session, summary } = (await req.json()) as ChatBody
    let summaryToSend = summaryGenerator(summary)
    let promptToSend = SYSTEM_PROMPT[session] + summaryToSend

    // console.log('promptToSend', promptToSend)
    let messagesToSend = await extractMessages(messages, model, promptToSend)
    console.log(name, ': messagesToSend', messagesToSend)

    const res = await functionCallResponse(
      model,
      messagesToSend,
      promptToSend,
      FUNCTION_TO_CALL.SESSION_ENDED,
    )

    return res
  } catch (error) {
    console.error(error)
    return new Response('Error', { status: 500 })
  }
}

export default handler
