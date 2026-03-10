import Anthropic from '@anthropic-ai/sdk'

export const sendMessageToAnthropic = async (
  apiKey: string,
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  prdContext: string,
  model: string
) => {
  const anthropic = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true
  })

  const systemMessage = `You are an expert Product Manager. Your goal is to help the user create a comprehensive Product Requirements Document (PRD).
Current PRD Content:
${prdContext}

Response format:
If you need more information to update the PRD, respond with a JSON object:
{ "type": "question", "content": "Your question here", "options": ["Option 1", "Option 2"] }

If you have enough information to update the PRD, respond with a JSON object:
{ "type": "update", "content": "The FULL updated PRD in markdown format" }

IMPORTANT: Respond ONLY with the JSON object.
`

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 4096,
      system: systemMessage,
      messages: messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : ('user' as any),
          content: m.content
        }))
    })

    const content = (response.content[0] as any).text
    if (!content) throw new Error('Empty response from Anthropic')
    return JSON.parse(content)
  } catch (error: any) {
    if (
      error.status === 400 &&
      (error.message?.includes('max_tokens') || error.message?.includes('context'))
    ) {
      throw new Error('CONTEXT_LIMIT_REACHED')
    }
    throw error
  }
}
