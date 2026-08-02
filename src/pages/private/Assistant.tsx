import { useState, type FormEvent } from 'react'
import { askAssistant } from '../../api/assistant'

interface Message {
  role: 'user' | 'assistant'
  text: string
}

const INITIAL_MESSAGES: Message[] = [
  {
    role: 'assistant',
    text: '¡Hola! Soy tu asistente de Globalance. Preguntame por la cotización del dólar, el euro o el peso argentino.',
  },
]

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return
    setMessages((prev) => [...prev, { role: 'user', text }])
    setInput('')
    setLoading(true)
    try {
      const reply = await askAssistant(text)
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Asistente IA</h1>
      <div className="flex h-[70vh] flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                  m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-500">Escribiendo...</div>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2 border-t border-gray-200 p-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Preguntá, por ejemplo: ¿cuál es la cotización del dólar?"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  )
}
