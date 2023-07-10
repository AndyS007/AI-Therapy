import { OpenAIModel } from '@/types/openai'
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from 'eventsource-parser'
import { Message } from '@/types/chat'
import { FUNCTION_CALLABLE, FUNCTION_TO_CALL } from '@/types/prompt'

interface Props {
  model: OpenAIModel
  messages: Message[]
  systemPrompt: string
}
export const OpenAIStream = async (
  model: OpenAIModel,
  messages: Message[],
  systemPrompt: string,
) => {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    method: 'POST',
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...messages,
      ],
      max_tokens: 800,
      temperature: 0.0,
      stream: true,
    }),
  })

  if (res.status !== 200) {
    throw new Error('OpenAI API returned an error')
  }

  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = event.data

          if (data === '[DONE]') {
            controller.close()
            return
          }

          try {
            const json = JSON.parse(data)
            const text = json.choices[0].delta.content
            const queue = encoder.encode(text)
            controller.enqueue(queue)
          } catch (e) {
            controller.error(e)
          }
        }
      }

      const parser = createParser(onParse)

      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk))
      }
    },
  })

  return stream
}

export const functionCallResponse = async (
  model: OpenAIModel,
  messages: Message[],
  systemPrompt: string,
  functionToCall: FUNCTION_TO_CALL,
) => {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    method: 'POST',
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...messages,
      ],

      max_tokens: 800,
      temperature: 0.0,
      functions: [FUNCTION_CALLABLE[functionToCall]],
      function_call: { name: functionToCall },
    }),
  })

  if (res.status !== 200) {
    throw new Error('OpenAI API returned an error')
  }

  // const data = await res.json()
  return res
}
