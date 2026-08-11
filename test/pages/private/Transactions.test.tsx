import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Transactions from '../../../src/pages/private/Transactions'
import { seedDemoUser, seedDemoWallet, seedExtraTransactions } from '../../fixtures/db'

describe('Transactions', () => {
  beforeEach(async () => {
    localStorage.clear()
    await seedDemoUser()
  })

  test('muestra la tabla con las seis columnas y las transacciones del usuario', async () => {
    render(<Transactions />)

    await screen.findByText('Depósito de sueldo')

    const headers = screen.getAllByRole('columnheader').map((h) => h.textContent)
    expect(headers).toEqual(['Fecha', 'Concepto', 'Categoría', 'Moneda', 'Importe', 'Estado'])

    expect(screen.getByText('Depósito de sueldo')).toBeInTheDocument()
    expect(screen.getByText('Pago de alquiler')).toBeInTheDocument()
    expect(screen.getByText('Cena compartida con amigos')).toBeInTheDocument()
    expect(screen.getByText('Conversión desde EUR')).toBeInTheDocument()
  })

  test('filtra por búsqueda de descripción o concepto', async () => {
    const user = userEvent.setup()
    render(<Transactions />)

    await screen.findByText('Depósito de sueldo')

    await user.type(screen.getByPlaceholderText('Buscar por descripción o concepto...'), 'alquiler')

    expect(screen.getByText('Pago de alquiler')).toBeInTheDocument()
    expect(screen.queryByText('Depósito de sueldo')).not.toBeInTheDocument()
  })

  test('filtra con los chips de tipo', async () => {
    const user = userEvent.setup()
    render(<Transactions />)

    await screen.findByText('Depósito de sueldo')

    await user.click(screen.getByRole('button', { name: 'Conversiones' }))

    expect(screen.getByText('Conversión desde EUR')).toBeInTheDocument()
    expect(screen.queryByText('Depósito de sueldo')).not.toBeInTheDocument()
  })

  test('filtra por moneda y estado con los filtros avanzados', async () => {
    const user = userEvent.setup()
    render(<Transactions />)

    await screen.findByText('Depósito de sueldo')

    await user.click(screen.getByRole('button', { name: /Filtros/ }))

    await user.click(screen.getByRole('button', { name: 'Moneda' }))
    await user.click(within(screen.getByRole('option', { name: 'USD' })).getByRole('button'))

    expect(screen.getByText('Ingreso Northwind Studio')).toBeInTheDocument()
    expect(screen.queryByText('Depósito de sueldo')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Estado' }))
    await user.click(within(screen.getByRole('option', { name: 'Completada' })).getByRole('button'))

    expect(screen.getByText('Ingreso Northwind Studio')).toBeInTheDocument()
    expect(screen.queryByText('Depósito de sueldo')).not.toBeInTheDocument()
  })

  test('pagina de a diez transacciones por página', async () => {
    const user = userEvent.setup()

    const walletId = await seedDemoWallet()
    await seedExtraTransactions(walletId, 15)

    render(<Transactions />)

    await screen.findByText('Movimiento extra 15')

    expect(screen.getByText('Depósito de sueldo')).toBeInTheDocument()
    expect(screen.queryByText('Movimiento extra 11')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Página 2' }))

    expect(screen.getByText('Movimiento extra 11')).toBeInTheDocument()
    expect(screen.queryByText('Depósito de sueldo')).not.toBeInTheDocument()
  })

  test('muestra mensaje de vacío cuando no hay coincidencias', async () => {
    const user = userEvent.setup()
    render(<Transactions />)

    await screen.findByText('Depósito de sueldo')

    await user.type(screen.getByPlaceholderText('Buscar por descripción o concepto...'), 'inexistente-xyz')

    expect(screen.getByText('No hay movimientos para los filtros seleccionados.')).toBeInTheDocument()
  })

  test('abre el modal al hacer clic en una fila', async () => {
    const user = userEvent.setup()
    render(<Transactions />)

    const row = await screen.findByText('Pago de alquiler')
    await user.click(row)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText('Alquiler de julio')).toBeInTheDocument()
  })
})
