import { functionCallResponse, OpenAIStream } from '@/utils'
import { ChatBody } from '@/types/chat'
import { DEFAULT_SYSTEM_PROMPT, systemPrompt } from '@/types/prompt'

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
    console.log('promptToSend', promptToSend)

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
            content: promptToSend,
          },
          ...messages,
        ],

        max_tokens: 800,
        temperature: 0.0,
        function_call: { name: 'generate_summary' },
        functions: [
          {
            name: 'generate_summary',
            description:
              'Based on the therapy conversation to generate a summary of the therapy session according to the Example',
            parameters: {
              type: 'object',
              properties: {
                summary: {
                  type: 'string',
                  description:
                    'The summary of the therapy session according to the Example',
                },
              },
              required: ['summary'],
            },
          },
        ],
      }),
    })

    // return new Response(res.body)
    return res
  } catch (error) {
    console.error(error)
    return new Response('Error', { status: 500 })
  }
}

export default handler
