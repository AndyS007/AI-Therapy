import { extractMessages, OpenAIStream } from '@/utils'
import { ChatBody } from '@/types/chat'
import { summaryGenerator, SYSTEM_PROMPT } from '@/types/prompt'

export const config = {
  runtime: 'edge',
}

const handler = async (req: Request): Promise<Response> => {
  try {
    const data = (await req.json()) as ChatBody
    // console.log(data)
    const { model, messages, session, summary } = data

    let summaryToSend = summaryGenerator(summary)

    let promptToSend = SYSTEM_PROMPT[session] + summaryToSend
    // console.log(promptToSend)

    let messagesToSend = await extractMessages(messages, model, session)

    const stream = await OpenAIStream(model, messagesToSend, promptToSend)

    return new Response(stream)
  } catch (error) {
    console.error(error)
    return new Response('Error', { status: 500 })
  }
}

export default handler
