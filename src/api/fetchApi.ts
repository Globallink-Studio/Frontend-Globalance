const API_URL = import.meta.env.VITE_API_URL ?? ''

export class UnauthorizedError extends Error {
  constructor() {
    super('Sesión expirada')
    this.name = 'UnauthorizedError'
  }
}

export async function fetchApi<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string } = {},
): Promise<T> {
  const { method = 'GET', body, token } = options
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (response.status === 401) throw new UnauthorizedError()
  if (!response.ok) throw new Error(`Error ${response.status}: ${await response.text()}`)

  return (await response.json()) as T
}
