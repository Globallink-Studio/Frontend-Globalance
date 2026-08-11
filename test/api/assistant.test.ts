import { askAssistant } from '../../src/api/assistant'
import { fetchApi } from '../../src/api/fetchApi'

const { getAuthModeMock } = vi.hoisted(() => ({ getAuthModeMock: vi.fn(() => 'mock') }))

vi.mock('../../src/api/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/api/auth')>()
  return { ...actual, getAuthMode: getAuthModeMock }
})

vi.mock('../../src/api/fetchApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/api/fetchApi')>()
  return { ...actual, fetchApi: vi.fn() }
})

const mockFetch = vi.mocked(fetchApi)

describe('assistant API — modo mock (desarrollo local)', () => {
  beforeEach(() => {
    localStorage.clear()
    getAuthModeMock.mockReturnValue('mock')
    mockFetch.mockReset()
  })

  test('responde a un saludo', async () => {
    const reply = await askAssistant('Hola')
    expect(reply).toContain('¡Hola!')
  })

  test('responde con la cotización del dólar', async () => {
    const reply = await askAssistant('¿cuál es la cotización del dólar?')
    expect(reply).toContain('Compra')
    expect(reply).toContain('Venta')
  })
})

describe('assistant API — modo firebase (API real)', () => {
  beforeEach(() => {
    localStorage.clear()
    getAuthModeMock.mockReturnValue('firebase')
    mockFetch.mockReset()
  })

  test('envía el mensaje a POST /ai/assistant y devuelve la respuesta', async () => {
    mockFetch.mockResolvedValue({ reply: 'Tu saldo en dólares es de 1500 USD.' })

    const reply = await askAssistant('¿cuánto tengo en dólares?')

    expect(mockFetch).toHaveBeenCalledWith('/ai/assistant', {
      method: 'POST',
      body: { message: '¿cuánto tengo en dólares?' },
    })
    expect(reply).toBe('Tu saldo en dólares es de 1500 USD.')
  })

  test('rechaza un mensaje vacío antes de llamar a la API', async () => {
    await expect(askAssistant('   ')).rejects.toThrow('El mensaje no puede estar vacío')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  test('propaga los errores de la API', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    await expect(askAssistant('hola')).rejects.toThrow('Network error')
  })
})
