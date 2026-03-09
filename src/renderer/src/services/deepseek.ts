const API_URL = 'https://api.deepseek.com/chat/completions'

export interface DeepseekResponse {
  type: 'question' | 'update' | 'error'
  content: string
  options?: string[]
}

export const sendMessageToDeepseek = async (
  apiKey: string,
  messages: { role: string; content: string }[],
  prdContent: string,
  model: string = 'deepseek-chat'
): Promise<DeepseekResponse> => {
  const systemMessage = `You are an expert Product Manager assistant helping to write a Product Requirements Document (PRD).

  Your goal is to iteratively build the PRD based on user input.

  Current PRD Content:
  \`\`\`markdown
  ${prdContent}
  \`\`\`

  Rules:
  1. Ask EXACTLY ONE clarifying question at a time if the user's request is ambiguous or insufficient.
  2. Wait for user answers before proposing PRD changes.
  3. If you are proposing changes to the PRD, output the FULL updated PRD content in Markdown. Do not include conversational filler.
  4. If you are asking a clarifying question, you MUST provide 2-4 short, specific multiple-choice options for the user to choose from, if applicable.

  Response Format (JSON only):
  You must respond with a valid JSON object. Do not include any text outside the JSON block.

  If asking a question:
  {
    "type": "question",
    "content": "Your question here...",
    "options": ["Option 1", "Option 2", "Option 3"]
  }

  If updating the PRD:
  {
    "type": "update",
    "content": "The full updated markdown content..."
  }
  `

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 120000)

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: systemMessage }, ...messages],
        temperature: 0.7,
        stream: false,
        response_format: { type: 'json_object' }
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      const errorMessage =
        errorData?.error?.message || `API request failed with status ${response.status}`
      return { type: 'error', content: errorMessage }
    }

    const data = await response.json()
    const rawContent = data.choices[0].message.content.trim()

    try {
      const parsed = JSON.parse(rawContent)
      return {
        type: parsed.type || 'question',
        content: parsed.content || rawContent,
        options: parsed.options
      }
    } catch {
      console.error('Failed to parse JSON response')
      return { type: 'question', content: rawContent }
    }
  } catch (error: any) {
    clearTimeout(timeoutId)
    console.error('Deepseek API Error:', error)

    if (error.name === 'AbortError') {
      return {
        type: 'error',
        content: 'Request timed out after 2 minutes. Please try again with a simpler request.'
      }
    }

    return {
      type: 'error',
      content: error.message || 'Unknown error occurred'
    }
  }
}
