import { useState, type FormEvent } from 'react'
import { askAssistant } from '../../api/assistant'
import '../../styles/pages/private/assistant.css'

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
    <div className="assistant">
      <h1 className="assistant__title">Asistente IA</h1>
      <div className="assistant-chat">
        <div className="assistant-chat__messages">
          {messages.map((m, i) => (
            <div key={i} className={`assistant-message assistant-message--${m.role}`}>
              <div className="assistant-message__bubble">{m.text}</div>
            </div>
          ))}
          {loading && (
            <div className="assistant-message assistant-message--assistant">
              <div className="assistant-message__bubble">Escribiendo...</div>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="assistant-chat__composer">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Preguntá, por ejemplo: ¿cuál es la cotización del dólar?"
            className="assistant-chat__input"
          />
          <button type="submit" disabled={loading} className="assistant-chat__send">
            Enviar
          </button>
        </form>
      </div>
    </div>
  )
}
