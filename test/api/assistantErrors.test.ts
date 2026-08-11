import { ApiError, NetworkError } from '../../src/api/errors'
import { getAssistantErrorMessage, isRetryableAssistantError } from '../../src/api/assistantErrors'

describe('assistant errors — mensajes amigables', () => {
  test('mapea cada código de error a su mensaje', () => {
    expect(getAssistantErrorMessage(new ApiError(400))).toBe(
      'El mensaje no pudo ser procesado. Reformulá la pregunta e intentá de nuevo.',
    )
    expect(getAssistantErrorMessage(new ApiError(401))).toBe(
      'Tu sesión expiró. Volvé a iniciar sesión y probá de nuevo.',
    )
    expect(getAssistantErrorMessage(new ApiError(429))).toBe(
      'Hiciste muchas consultas seguidas. Esperá unos segundos y volvé a intentar.',
    )
    expect(getAssistantErrorMessage(new ApiError(500))).toBe(
      'Hubo un error en el servidor al responder. Intentá de nuevo en unos minutos.',
    )
    expect(getAssistantErrorMessage(new ApiError(502))).toBe(
      'El servicio de inteligencia artificial no está disponible en este momento. Intentá de nuevo más tarde.',
    )
    expect(getAssistantErrorMessage(new ApiError(503))).toBe(
      'El servicio de inteligencia artificial no está disponible en este momento. Intentá de nuevo más tarde.',
    )
    expect(getAssistantErrorMessage(new ApiError(504))).toBe(
      'El servicio de inteligencia artificial no está disponible en este momento. Intentá de nuevo más tarde.',
    )
    expect(getAssistantErrorMessage(new ApiError(418))).toBe(
      'Estamos teniendo un problema con el asistente. Intentá de nuevo en unos minutos.',
    )
  })

  test('mapea los errores de red', () => {
    expect(getAssistantErrorMessage(new NetworkError())).toBe(
      'No pudimos conectarnos con el servidor. Revisá tu conexión y volvé a intentar.',
    )
  })

  test('devuelve un mensaje genérico para errores desconocidos', () => {
    expect(getAssistantErrorMessage(new Error('cualquier cosa'))).toBe(
      'Algo salió mal. Por favor, intentá de nuevo.',
    )
  })
})

describe('assistant errors — reintento', () => {
  test('marca como reintentables los errores 429, 500, 502, 503 y 504', () => {
    expect(isRetryableAssistantError(new ApiError(429))).toBe(true)
    expect(isRetryableAssistantError(new ApiError(500))).toBe(true)
    expect(isRetryableAssistantError(new ApiError(502))).toBe(true)
    expect(isRetryableAssistantError(new ApiError(503))).toBe(true)
    expect(isRetryableAssistantError(new ApiError(504))).toBe(true)
  })

  test('no marca como reintentables otros errores', () => {
    expect(isRetryableAssistantError(new ApiError(400))).toBe(false)
    expect(isRetryableAssistantError(new ApiError(401))).toBe(false)
    expect(isRetryableAssistantError(new NetworkError())).toBe(false)
    expect(isRetryableAssistantError(new Error('cualquier cosa'))).toBe(false)
  })
})
