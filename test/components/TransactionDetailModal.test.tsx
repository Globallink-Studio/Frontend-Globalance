import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TransactionDetailModal from '../../src/components/TransactionDetailModal'
import type { Transaction } from '../../src/mocks/data/transactions'

const tx: Transaction = {
  id: 'tx-1',
  wallet_id: 'wallet-1',
  currency_code: 'ARS',
  type: 'transfer',
  amount: 12500,
  description: 'Pago de alquiler',
  status: 'completed',
  created_at: '2026-07-25T15:30:00.000Z',
  concept: 'Alquiler de julio',
}

describe('TransactionDetailModal', () => {
  test('no renderiza nada si no hay transacción', () => {
    render(<TransactionDetailModal transaction={null} onClose={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  test('muestra los datos de la transacción', () => {
    render(<TransactionDetailModal transaction={tx} onClose={vi.fn()} />)
    expect(screen.getByRole('dialog', { name: 'Detalle de transacción' })).toBeInTheDocument()
    expect(screen.getByText('Transferencia')).toBeInTheDocument()
    expect(screen.getByText('12.500 ARS')).toBeInTheDocument()
    expect(screen.getByText('Completada')).toBeInTheDocument()
    expect(screen.getByText('Pago de alquiler')).toBeInTheDocument()
    expect(screen.getByText('Alquiler de julio')).toBeInTheDocument()
    expect(screen.getByText('ARS')).toBeInTheDocument()
    expect(screen.getByText('tx-1')).toBeInTheDocument()
  })

  test('no muestra el concepto si la transacción no tiene', () => {
    render(<TransactionDetailModal transaction={{ ...tx, concept: undefined }} onClose={vi.fn()} />)
    expect(screen.queryByText('Concepto')).not.toBeInTheDocument()
  })

  test('cierra al presionar Escape', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<TransactionDetailModal transaction={tx} onClose={onClose} />)

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  test('cierra al hacer clic en el overlay', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<TransactionDetailModal transaction={tx} onClose={onClose} />)

    const overlay = document.querySelector('.modal__overlay')
    expect(overlay).not.toBeNull()
    await user.click(overlay as HTMLElement)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  test('cierra al hacer clic en el botón cerrar', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<TransactionDetailModal transaction={tx} onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
