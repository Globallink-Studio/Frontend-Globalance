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
    return 'No pudimos conectarnos con el servidor. Revisá tu conexión a internet y volvé a intentar.'
  }

  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        return 'Los datos ingresados no son válidos. Revisalos e intentá de nuevo.'
      case 401:
        return 'Correo o contraseña incorrectos.'
      case 404:
        return 'No encontramos lo que buscás.'
      default:
        return 'Estamos teniendo un problema del lado del servidor. Intentá de nuevo en unos minutos.'
    }
  }

  return 'Algo salió mal. Por favor, intentá de nuevo.'
}
