import { extractMessages, OpenAIStream } from '@/utils'
import { ChatBody } from '@/types/chat'
import { DEFAULT_SYSTEM_PROMPT, SYSTEM_PROMPT } from '@/types/prompt'

export const config = {
  runtime: 'edge',
}

const handler = async (req: Request): Promise<Response> => {
  try {
    const { model, messages, prompt, session } = (await req.json()) as ChatBody
    let promptToSend = SYSTEM_PROMPT[session]
    // console.log(messages)

    let messagesToSend = await extractMessages(
      messages,
      model,
      session,
      promptToSend,
    )

    const stream = await OpenAIStream(model, messagesToSend, promptToSend)

    return new Response(stream)
  } catch (error) {
    console.error(error)
    return new Response('Error', { status: 500 })
  }
}

export default handler
