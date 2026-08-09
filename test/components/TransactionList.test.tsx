import { render, screen } from '@testing-library/react'
import TransactionList from '../../src/components/TransactionList'
import type { Transaction } from '../../src/mocks/data/transactions'

const transactions: Transaction[] = [
  {
    id: 'tx-1',
    wallet_id: 'wallet-1',
    currency_code: 'ARS',
    type: 'deposit',
    amount: 50000,
    description: 'Depósito de sueldo',
    status: 'completed',
    created_at: '2026-07-28T09:00:00.000Z',
  },
  {
    id: 'tx-2',
    wallet_id: 'wallet-1',
    currency_code: 'USD',
    type: 'transfer',
    amount: 350,
    description: 'Pago de hosting',
    status: 'pending',
    created_at: '2026-07-24T14:05:00.000Z',
    concept: 'Hosting anual',
  },
]

describe('TransactionList', () => {
  test('muestra mensaje de vacío si no hay transacciones', () => {
    render(<TransactionList transactions={[]} />)
    expect(screen.getByText('Sin transacciones.')).toBeInTheDocument()
  })

  test('renderiza descripciones, conceptos y montos en modo normal', () => {
    render(<TransactionList transactions={transactions} />)
    expect(screen.getByText('Depósito de sueldo')).toBeInTheDocument()
    expect(screen.getByText(/Hosting anual · Pendiente/)).toBeInTheDocument()
    expect(screen.getByText('50.000 ARS')).toBeInTheDocument()
    expect(screen.getByText('350 USD')).toBeInTheDocument()
  })

  test('renderiza en modo compact con la misma información', () => {
    render(<TransactionList transactions={transactions} compact />)
    expect(screen.getByText('Depósito de sueldo')).toBeInTheDocument()
    expect(screen.getByText(/Hosting anual · Pendiente/)).toBeInTheDocument()
    expect(screen.getByText('50.000 ARS')).toBeInTheDocument()
    expect(screen.getByText('350 USD')).toBeInTheDocument()
  })
})
