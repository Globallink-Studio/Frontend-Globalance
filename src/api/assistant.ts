import { ask } from '../mocks/handlers/assistant'
import { getAuthMode } from './auth'
import { fetchApi } from './fetchApi'

interface ApiAssistantResponse {
  reply: string
}

export async function askAssistant(message: string): Promise<string> {
  if (!message || !message.trim()) throw new Error('El mensaje no puede estar vacío')

  if (getAuthMode() === 'firebase') {
    const resp = await fetchApi<ApiAssistantResponse>('/ai/assistant', {
      method: 'POST',
      body: { message },
    })
    return resp.reply
  }

  return ask(message)
}
