export enum OpenAIModel {
  GPT_3_5 = 'gpt-3.5-turbo',
  GPT_3_5_16K = 'gpt-3.5-turbo-16k',
  GPT_4 = 'gpt-4',
}

export const OpenAIModelNames: Record<OpenAIModel, string> = {
  [OpenAIModel.GPT_3_5]: 'GPT-3.5',
  [OpenAIModel.GPT_3_5_16K]: 'GPT-3.5 16K',
  [OpenAIModel.GPT_4]: 'GPT-4',
}
