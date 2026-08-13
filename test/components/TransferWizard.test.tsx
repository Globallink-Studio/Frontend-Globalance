import { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import TransferWizard from '../../src/components/TransferWizard'
import { seedDemoUser } from '../fixtures/db'

function Harness({
  onDone = () => {},
  onError = () => {},
}: {
  onDone?: (msg: string) => void
  onError?: (error: unknown) => void
}) {
  const [step, setStep] = useState(1)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  return (
    <div>
      <TransferWizard
        contacts={[]}
        step={step}
        setStep={setStep}
        onDone={onDone}
        onError={(err) => {
          if (typeof err === 'string') setError(err)
          onError(err)
        }}
        sending={sending}
        setSending={setSending}
      />
      {error && <p role="alert">{error}</p>}
    </div>
  )
}

describe('TransferWizard — métodos de envío', () => {
  beforeEach(async () => {
    localStorage.clear()
    await seedDemoUser()
  })

  test('muestra Alias, Número de cuenta y Contacto con placeholder según el método', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    expect(screen.getByRole('radio', { name: 'Alias' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Número de cuenta' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Contacto' })).toBeInTheDocument()

    const destinationInput = screen.getByLabelText('Alias del destinatario')
    expect(destinationInput).toHaveAttribute('placeholder', 'juan.cash')

    await user.click(screen.getByRole('radio', { name: 'Número de cuenta' }))

    expect(screen.getByLabelText('Número de cuenta del destinatario')).toBeInTheDocument()
    expect(screen.getByLabelText('Número de cuenta del destinatario')).toHaveAttribute(
      'placeholder',
      '0000000002',
    )

    await user.click(screen.getByRole('radio', { name: 'Alias' }))
    expect(screen.getByLabelText('Alias del destinatario')).toHaveAttribute('placeholder', 'juan.cash')
  })

  test('envía por número de cuenta y confirma la transferencia', async () => {
    const user = userEvent.setup()
    const onDone = vi.fn()
    render(<Harness onDone={onDone} />)

    await user.click(screen.getByRole('radio', { name: 'Número de cuenta' }))
    await user.type(screen.getByLabelText('Número de cuenta del destinatario'), '0000000002')
    await user.type(screen.getByLabelText('Monto'), '1000')
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    expect(await screen.findByText('juan.cash')).toBeInTheDocument()
    expect(screen.getByText('0000000002')).toBeInTheDocument()
    expect(screen.getByText('Número de cuenta')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Confirmar transferencia' }))

    await waitFor(() => expect(onDone).toHaveBeenCalledWith('Transferencia a juan.cash enviada'))
  })

  test('muestra un error si el número de cuenta no existe', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole('radio', { name: 'Número de cuenta' }))
    await user.type(screen.getByLabelText('Número de cuenta del destinatario'), '9999999999')
    await user.type(screen.getByLabelText('Monto'), '1000')
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se encontró ninguna cuenta activa con ese número',
    )
  })
})
