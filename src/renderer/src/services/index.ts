import { sendMessageToDeepseek } from './deepseek'
import { sendMessageToOpenAI } from './openai'
import { sendMessageToAnthropic } from './anthropic'
import { sendMessageToGemini } from './gemini'

export const sendMessage = async (
  apiKeys: Record<string, string | null>,
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  prdContext: string,
  model: string
) => {
  if (model.startsWith('gemini-')) {
    const key = apiKeys['gemini']
    if (!key) throw new Error('Gemini API key not set')
    return sendMessageToGemini(key, messages, prdContext, model)
  }

  if (model.startsWith('gpt-')) {
    const key = apiKeys['openai']
    if (!key) throw new Error('OpenAI API key not set')
    return sendMessageToOpenAI(key, messages, prdContext, model)
  }

  if (model.startsWith('claude-')) {
    const key = apiKeys['anthropic']
    if (!key) throw new Error('Anthropic API key not set')
    return sendMessageToAnthropic(key, messages, prdContext, model)
  }

  if (model.startsWith('deepseek-')) {
    const key = apiKeys['deepseek']
    if (!key) throw new Error('DeepSeek API key not set')
    return sendMessageToDeepseek(key, messages, prdContext, model)
  }

  throw new Error(`Unsupported model: ${model}`)
}
