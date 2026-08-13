import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Cards from '../../../../src/pages/private/profile/Cards'
import { formatExpiry } from '../../../../src/utils/cardFormat'
import { seedDemoUser } from '../../../fixtures/db'

describe('formatExpiry', () => {
  test('inserta la barra automáticamente', () => {
    expect(formatExpiry('0')).toBe('0')
    expect(formatExpiry('01')).toBe('01')
    expect(formatExpiry('018')).toBe('01/8')
    expect(formatExpiry('0187')).toBe('01/87')
    expect(formatExpiry('011287')).toBe('01/12')
  })

  test('mantiene un vencimiento ya formateado', () => {
    expect(formatExpiry('05/30')).toBe('05/30')
  })

  test('ignora caracteres no numéricos', () => {
    expect(formatExpiry('abc')).toBe('')
    expect(formatExpiry('0a1/8x7')).toBe('01/87')
  })

  test('permite borrar sin quedarse pegado en la barra', () => {
    expect(formatExpiry('01/')).toBe('01')
    expect(formatExpiry('0')).toBe('0')
  })
})

describe('Cards — vencimiento', () => {
  beforeEach(async () => {
    localStorage.clear()
    await seedDemoUser()
  })

  test('el campo Vencimiento inserta la barra al escribir y guarda el valor formateado', async () => {
    const user = userEvent.setup()
    render(<Cards />)

    await user.click(screen.getByRole('button', { name: 'Agregar tarjeta' }))
    const expiryInput = screen.getByLabelText('Vencimiento')
    await user.type(expiryInput, '0187')

    expect(expiryInput).toHaveValue('01/87')

    await user.type(screen.getByLabelText('Titular'), 'Sofia Test')
    await user.type(screen.getByLabelText('Últimos 4 dígitos'), '4242')
    await user.click(
      screen.getByRole('checkbox', { name: 'Estoy de acuerdo con agregar esta tarjeta al sitio' }),
    )
    await user.click(screen.getAllByRole('button', { name: 'Agregar tarjeta' })[1])

    expect(await screen.findByText('01/87')).toBeInTheDocument()
  })
})
