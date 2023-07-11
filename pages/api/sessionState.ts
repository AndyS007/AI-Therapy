import { ChatBody } from '@/types/chat'
import {
  DEFAULT_SYSTEM_PROMPT,
  FUNCTION_TO_CALL,
  SYSTEM_PROMPT,
} from '@/types/prompt'
import { functionCallResponse, extractMessages } from '@/utils'

export const config = {
  runtime: 'edge',
}

const handler = async (req: Request): Promise<Response> => {
  try {
    const { model, messages, prompt, session } = (await req.json()) as ChatBody
    let promptToSend = SYSTEM_PROMPT[session]

    // console.log('promptToSend', promptToSend)
    let messagesToSend = await extractMessages(
      messages,
      model,
      session,
      promptToSend,
    )

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
