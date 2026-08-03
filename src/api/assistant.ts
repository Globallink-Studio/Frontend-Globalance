import { ask } from '../mocks/handlers/assistant'

export async function askAssistant(message: string): Promise<string> {
  return ask(message)
}
