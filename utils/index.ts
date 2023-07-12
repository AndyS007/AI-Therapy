import {
  OpenAIModel,
  OpenAIModelID,
  OpenAIModels,
  RESPONSE_TOKEN_LIMIT,
} from '@/types/openai'
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from 'eventsource-parser'
import { Message } from '@/types/chat'
import { FUNCTION_CALLABLE, FUNCTION_TO_CALL, SESSIONS } from '@/types/prompt'

// @ts-ignore
// import wasm from '@dqbd/tiktoken/lite/tiktoken_bg.wasm?module'
//
// import tiktokenModel from '@dqbd/tiktoken/encoders/cl100k_base.json'
// import { Tiktoken, init } from '@dqbd/tiktoken/lite/init'
// const encoding = new Tiktoken(
//   tiktokenModel.bpe_ranks,
//   tiktokenModel.special_tokens,
//   tiktokenModel.pat_str,
// )

// TODO: Use tiktoken
export const extractMessages = async (
  messages: Message[],
  model: OpenAIModelID,
  systemPrompt: string,
) => {
  // await init((imports) => WebAssembly.instantiate(wasm, imports))
  let tokenLimit = OpenAIModels[model].tokenLimit
  let messagesToSend: Message[] = []
  // let tokenCount = encoding.encode(systemPrompt).length
  let tokenCount = systemPrompt.length

  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i]
    // const tokens = encoding.encode(message.content)

    if (tokenCount + message.content.length > tokenLimit) {
      break
    }
    tokenCount += message.content.length
    // console.log('token count:', tokenCount)
    messagesToSend = [message, ...messagesToSend]
  }

  return messagesToSend
}

export const OpenAIStream = async (
  model: OpenAIModelID,
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
  model: OpenAIModelID,
  messages: Message[],
  systemPrompt: string,
  functionToCall: FUNCTION_TO_CALL,
) => {
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
