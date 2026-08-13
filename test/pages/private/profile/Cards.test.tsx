import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Cards from '../../../../src/pages/private/profile/Cards'
import { formatExpiry, getExpiryError } from '../../../../src/utils/cardFormat'
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

describe('getExpiryError', () => {
  test('valida el formato MM/AA', () => {
    expect(getExpiryError('')).toBe('El vencimiento es obligatorio.')
    expect(getExpiryError('01')).toBe('El vencimiento debe tener formato MM/AA.')
    expect(getExpiryError('13/30')).toBe('El mes debe estar entre 01 y 12.')
    expect(getExpiryError('00/30')).toBe('El mes debe estar entre 01 y 12.')
  })

  test('rechaza un vencimiento anterior a la fecha actual', () => {
    expect(getExpiryError('01/20')).toBe('La tarjeta está vencida.')
  })

  test('acepta un vencimiento en el mes actual o posterior', () => {
    const futureYear = new Date().getFullYear() + 5
    const yy = String(futureYear).slice(-2)
    expect(getExpiryError(`01/${yy}`)).toBeUndefined()
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

    const futureYear = new Date().getFullYear() + 5
    const yy = String(futureYear).slice(-2)

    await user.click(screen.getByRole('button', { name: 'Agregar tarjeta' }))
    const expiryInput = screen.getByLabelText('Vencimiento')
    await user.type(expiryInput, `01${yy}`)

    expect(expiryInput).toHaveValue(`01/${yy}`)

    await user.type(screen.getByLabelText('Titular'), 'Sofia Test')
    await user.type(screen.getByLabelText('Últimos 4 dígitos'), '4242')
    await user.click(
      screen.getByRole('checkbox', { name: 'Estoy de acuerdo con agregar esta tarjeta al sitio' }),
    )
    await user.click(screen.getAllByRole('button', { name: 'Agregar tarjeta' })[1])

    expect(await screen.findByText(`01/${yy}`)).toBeInTheDocument()
  })

  test('muestra un error si el vencimiento es anterior a la fecha actual', async () => {
    const user = userEvent.setup()
    render(<Cards />)

    await user.click(screen.getByRole('button', { name: 'Agregar tarjeta' }))
    const expiryInput = screen.getByLabelText('Vencimiento')
    await user.type(expiryInput, '0120')

    expect(await screen.findByText('La tarjeta está vencida.')).toBeInTheDocument()
    expect(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Agregar tarjeta' }),
    ).toBeDisabled()
  })
})
