export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message?: string) {
    super(message ?? `Error ${status}`)
    this.name = 'ApiError'
    this.status = status
  }
}

export class NetworkError extends Error {
  constructor() {
    super('Network error')
    this.name = 'NetworkError'
  }
}

export function getFriendlyErrorMessage(error: unknown): string {
  if (error instanceof NetworkError) {
    return 'No pudimos conectarnos con el servidor. Revisa tu conexión a internet y vuelve a intentar.'
  }

  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        return 'Los datos ingresados no son válidos. Revísalos e intenta de nuevo.'
      case 401:
        return 'Tu sesión venció. Vuelve a iniciar sesión.'
      case 403:
        return 'No tienes permisos para realizar esta acción.'
      case 404:
        return 'No encontramos lo que buscas. Revisa los datos e intenta de nuevo.'
      case 409:
        return 'Ya existe un registro con esos datos. Verifícalo e intenta de nuevo.'
      case 422:
        return 'Los datos ingresados no son válidos. Revísalos e intenta de nuevo.'
      case 429:
        return 'Hiciste demasiadas solicitudes en poco tiempo. Espera un momento y vuelve a intentar.'
      case 500:
      case 502:
      case 503:
      case 504:
        return 'Estamos teniendo un problema del lado del servidor. Intenta de nuevo en unos minutos.'
      default:
        return 'Estamos teniendo un problema del lado del servidor. Intenta de nuevo en unos minutos.'
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return 'Algo salió mal. Por favor, intenta de nuevo.'
}
