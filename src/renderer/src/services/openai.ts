import OpenAI from 'openai'

export const sendMessageToOpenAI = async (
  apiKey: string,
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  prdContext: string,
  model: string
) => {
  const openai = new OpenAI({
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
`

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemMessage },
        ...messages.map((m) => ({ role: m.role as any, content: m.content }))
      ],
      response_format: { type: 'json_object' }
    })

    const content = response.choices[0].message.content
    if (!content) throw new Error('Empty response from OpenAI')
    return JSON.parse(content)
  } catch (error: any) {
    if (error.status === 400 && error.code === 'context_length_exceeded') {
      throw new Error('CONTEXT_LIMIT_REACHED')
    }
    throw error
  }
}
