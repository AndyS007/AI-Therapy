import { ChatBody } from '@/types/chat'
import {
  DEFAULT_SYSTEM_PROMPT,
  FUNCTION_TO_CALL,
  systemPrompt,
} from '@/types/prompt'
import { functionCallResponse } from '@/utils'

export const config = {
  runtime: 'edge',
}

const handler = async (req: Request): Promise<Response> => {
  try {
    const { model, messages, prompt, stage } = (await req.json()) as ChatBody
    let promptToSend = systemPrompt[stage - 1]

    if (!promptToSend) {
      promptToSend = DEFAULT_SYSTEM_PROMPT
    }
    // console.log('promptToSend', promptToSend)

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
    }
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
