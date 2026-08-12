import { useEffect, useRef, useState, type FormEvent } from 'react'
import { askAssistant } from '../../api/assistant'
import { getAssistantErrorMessage } from '../../api/assistantErrors'
import '../../styles/pages/private/assistant.css'

interface Message {
  role: 'user' | 'assistant'
  text: string
  error?: boolean
}

const INITIAL_MESSAGES: Message[] = [
  {
    role: 'assistant',
    text: '¡Hola! Soy tu asistente de Globalance. Pregúntame por la cotización del dólar, el euro o el peso argentino.',
  },
]

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading])

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
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', text: getAssistantErrorMessage(err), error: true }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="assistant">
      <div className="assistant-chat">
        <div className="assistant-chat__messages">
          {messages.map((m, i) => (
            <div key={i} className={`assistant-message assistant-message--${m.role}${m.error ? ' assistant-message--error' : ''}`}>
              <div className="assistant-message__bubble">{m.text}</div>
            </div>
          ))}
          {loading && (
            <div className="assistant-message assistant-message--assistant">
              <div className="assistant-message__bubble">Escribiendo...</div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <p className="assistant-chat__disclaimer">El asistente genera sus respuestas con inteligencia artificial. Verifica la información antes de tomar decisiones financieras.</p>
        <form onSubmit={handleSubmit} className="assistant-chat__composer">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregunta, por ejemplo: ¿cuál es la cotización del dólar?"
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
