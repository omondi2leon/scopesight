export const MODEL_GROUPS = [
  {
    label: 'DeepSeek',
    provider: 'deepseek',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek V3 (Standard)' },
      { id: 'deepseek-reasoner', name: 'DeepSeek R1 (Reasoning)' }
    ]
  },
  {
    label: 'OpenAI',
    provider: 'openai',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o mini' },
      { id: 'o1', name: 'o1' }
    ]
  },
  {
    label: 'Anthropic',
    provider: 'anthropic',
    models: [
      { id: 'claude-3-5-sonnet-latest', name: 'Claude 3.5 Sonnet' },
      { id: 'claude-3-5-haiku-latest', name: 'Claude 3.5 Haiku' },
      { id: 'claude-3-opus-latest', name: 'Claude 3 Opus' }
    ]
  },
  {
    label: 'Gemini',
    provider: 'gemini',
    models: [
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' }
    ]
  }
]

export const ALL_MODELS = MODEL_GROUPS.flatMap((g) => g.models)

export const getProviderForModel = (modelId: string) => {
  return MODEL_GROUPS.find((g) => g.models.some((m) => m.id === modelId))?.provider
}
