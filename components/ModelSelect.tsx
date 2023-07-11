import { OpenAIModel, OpenAIModelID, OpenAIModels } from '@/types/openai'
import { FC } from 'react'

interface Props {
  model: OpenAIModelID
  onSelect: (model: OpenAIModelID) => void
}

export const ModelSelect: FC<Props> = ({ model, onSelect }) => {
  return (
    <div className="flex flex-col">
      <label className="text-left mb-2 dark:text-neutral-400 text-neutral-700">
        Model
      </label>
      <select
        className="w-[300px] p-3 dark:text-white dark:bg-[#343541] border border-neutral-500 rounded-lg appearance-none focus:shadow-outline text-neutral-900 cursor-pointer"
        placeholder="Select a model"
        value={model}
        onChange={(e) => onSelect(e.target.value as OpenAIModelID)}
      >
        {Object.entries(OpenAIModels).map(([key, model]) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
    </div>
  )
}
