import { Message, OpenAIModel } from '@/types/openai'
import { OpenAIStream } from '@/utils'
import { ChatBody } from '@/types/chat'
import { DEFAULT_SYSTEM_PROMPT } from '@/types/prompt'

export const config = {
  runtime: 'edge',
}

const handler = async (req: Request): Promise<Response> => {
  try {
    const { model, messages, prompt } = (await req.json()) as ChatBody
    let promptToSend = prompt

    if (!promptToSend) {
      promptToSend = DEFAULT_SYSTEM_PROMPT
    }

    const charLimit = 12000
    let charCount = 0
    let messagesToSend = []

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i]
      if (charCount + message.content.length > charLimit) {
        break
      }
      charCount += message.content.length
      messagesToSend.push(message)
      console.log(messagesToSend)
    }

    const stream = await OpenAIStream(model, messagesToSend, promptToSend)

    return new Response(stream)
  } catch (error) {
    console.error(error)
    return new Response('Error', { status: 500 })
  }
}

export default handler
