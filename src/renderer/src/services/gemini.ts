import { GoogleGenerativeAI } from '@google/generative-ai'

export const sendMessageToGemini = async (
  apiKey: string,
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  prdContext: string,
  model: string
) => {
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

  const genAI = new GoogleGenerativeAI(apiKey)
  const geminiModel = genAI.getGenerativeModel({
    model,
    systemInstruction: systemMessage,
    generationConfig: {
      responseMimeType: 'application/json'
    }
  })

  const chat = geminiModel.startChat({
    history: messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }))
  })

  // Get the last message from the input messages as the prompt
  const lastMessage = messages[messages.length - 1].content
  const result = await chat.sendMessage(lastMessage)
  const response = await result.response
  const content = response.text()
  if (!content) throw new Error('Empty response from Gemini')
  return JSON.parse(content)
}
