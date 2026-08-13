import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import WalletSummary from '../../../../src/pages/private/wallet/WalletSummary'
import { seedDemoUser, seedDemoWallet } from '../../../fixtures/db'
import { saveMockTransactions } from '../../../../src/mocks/storage'
import { DepositLimitError } from '../../../../src/api/errors'
import * as transactionsApi from '../../../../src/api/transactions'

const LIMIT_MESSAGE = 'Estás excediendo el límite máximo de dinero de esta moneda, el cual es 10.000.000 ARS'

describe('WalletSummary — límites de depósito', () => {
  beforeEach(async () => {
    localStorage.clear()
    await seedDemoUser()
  })

  test('exceso de monto: muestra el error en tiempo real y deshabilita Continuar', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <WalletSummary />
      </MemoryRouter>,
    )

    await user.click(await screen.findByRole('button', { name: 'Cargar saldo' }))
    await user.type(screen.getByLabelText('Monto'), '11000000')

    expect(screen.getByText('El máximo para depósitos en ARS es 10.000.000 ARS.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled()
  })

  test('red de seguridad: si el backend rechaza por límite, mantiene el modal abierto y enfoca el monto', async () => {
    const spy = vi
      .spyOn(transactionsApi, 'createDeposit')
      .mockRejectedValue(new DepositLimitError(LIMIT_MESSAGE))

    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <WalletSummary />
      </MemoryRouter>,
    )

    await user.click(await screen.findByRole('button', { name: 'Cargar saldo' }))
    await user.type(screen.getByLabelText('Monto'), '5000')
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await user.click(screen.getByRole('button', { name: 'Confirmar depósito' }))

    expect(await screen.findByText(LIMIT_MESSAGE)).toBeInTheDocument()
    const amountInput = screen.getByLabelText('Monto')
    expect(amountInput).toBeInTheDocument()
    expect(document.activeElement).toBe(amountInput)

    await user.click(screen.getByRole('button', { name: 'Confirmar' }))

    expect(screen.queryByText(LIMIT_MESSAGE)).not.toBeInTheDocument()
    expect(screen.getByLabelText('Monto')).toBeInTheDocument()
    expect(screen.getByText('Paso 1 de 2')).toBeInTheDocument()

    spy.mockRestore()
  })

  test('límite diario: cierra el modal de depósito y muestra el error', async () => {
    const walletId = await seedDemoWallet()
    const today = new Date().toISOString().slice(0, 10)
    saveMockTransactions(
      Array.from({ length: 30 }, (_, i) => ({
        id: `60000000-0000-4000-8000-${String(900000000001 + i)}`,
        wallet_id: walletId,
        currency_code: 'ARS',
        type: 'deposit' as const,
        amount: 1000,
        description: `Movimiento ${i + 1}`,
        status: 'completed' as const,
        created_at: `${today}T12:00:00.000Z`,
      })),
    )

    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <WalletSummary />
      </MemoryRouter>,
    )

    await user.click(await screen.findByRole('button', { name: 'Cargar saldo' }))
    await user.type(screen.getByLabelText('Monto'), '1000')
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await user.click(screen.getByRole('button', { name: 'Confirmar depósito' }))

    expect(await screen.findByText('Llegaste al límite de transacciones permitidas por día')).toBeInTheDocument()
    expect(screen.queryByLabelText('Monto')).not.toBeInTheDocument()
  })
})
