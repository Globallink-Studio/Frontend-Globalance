import { ApiError, NetworkError } from './errors'

export function getAssistantErrorMessage(error: unknown): string {
  if (error instanceof NetworkError) {
    return 'No pudimos conectarnos con el servidor. Revisa tu conexión y vuelve a intentar.'
  }

  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        return 'El mensaje no pudo ser procesado. Reformula la pregunta e intenta de nuevo.'
      case 401:
        return 'Tu sesión expiró. Vuelve a iniciar sesión y prueba de nuevo.'
      case 429:
        return 'Hiciste muchas consultas seguidas. Espera unos segundos y vuelve a intentar.'
      case 500:
        return 'Hubo un error en el servidor al responder. Intenta de nuevo en unos minutos.'
      case 502:
      case 503:
      case 504:
        return 'El servicio de inteligencia artificial no está disponible en este momento. Intenta de nuevo más tarde.'
      default:
        return 'Estamos teniendo un problema con el asistente. Intenta de nuevo en unos minutos.'
    }
  }

  return 'Algo salió mal. Por favor, intenta de nuevo.'
}

export function isRetryableAssistantError(error: unknown): boolean {
  return error instanceof ApiError && [429, 500, 502, 503, 504].includes(error.status)
}
