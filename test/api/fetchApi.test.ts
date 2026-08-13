import { fetchApi } from '../../src/api/fetchApi'
import { ApiError, getFriendlyErrorMessage } from '../../src/api/errors'

describe('fetchApi', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('incluye el mensaje del backend cuando el servidor devuelve un error JSON', async () => {
    const response = {
      status: 400,
      ok: false,
      json: vi.fn().mockResolvedValue({ message: 'Llegaste al límite de transacciones permitidas por día' }),
    } as unknown as Response
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(response)

    const error = await fetchApi('/transactions/income', { method: 'POST', body: {} }).catch((e) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(400)
    expect((error as ApiError).fromServer).toBe(true)
    expect(getFriendlyErrorMessage(error)).toBe('Llegaste al límite de transacciones permitidas por día')
  })

  test('usa el mensaje por defecto cuando el cuerpo del error no es JSON', async () => {
    const response = {
      status: 500,
      ok: false,
      json: vi.fn().mockRejectedValue(new SyntaxError('Invalid JSON')),
    } as unknown as Response
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(response)

    const error = await fetchApi('/transactions').catch((e) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).fromServer).toBe(false)
    expect(getFriendlyErrorMessage(error)).toBe(
      'Estamos teniendo un problema del lado del servidor. Intenta de nuevo en unos minutos.',
    )
  })
})
