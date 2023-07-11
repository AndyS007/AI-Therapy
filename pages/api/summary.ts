import { extractMessages, functionCallResponse, OpenAIStream } from '@/utils'
import { ChatBody } from '@/types/chat'
import { FUNCTION_TO_CALL, SYSTEM_PROMPT } from '@/types/prompt'

export const config = {
  runtime: 'edge',
}

const handler = async (req: Request): Promise<Response> => {
  try {
    const { model, messages, prompt, session } = (await req.json()) as ChatBody
    let promptToSend = SYSTEM_PROMPT[session]

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
      FUNCTION_TO_CALL.GENERATE_SUMMARY,
    )

    return res
  } catch (error) {
    console.error(error)
    return new Response('Error', { status: 500 })
  }
}

export default handler