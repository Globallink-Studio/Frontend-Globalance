import { ApiError, NetworkError } from './errors'

const API_URL = import.meta.env.VITE_API_URL ?? ''

export class UnauthorizedError extends ApiError {
  constructor() {
    super(401, 'Sesión expirada')
    this.name = 'UnauthorizedError'
  }
}

export async function fetchApi<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string } = {},
): Promise<T> {
  const { method = 'GET', body, token } = options

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new NetworkError()
  }

  if (response.status === 401) throw new UnauthorizedError()
  if (!response.ok) throw new ApiError(response.status)

  return (await response.json()) as T
}
