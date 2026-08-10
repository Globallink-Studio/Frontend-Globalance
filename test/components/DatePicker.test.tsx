import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DatePicker from '../../src/components/DatePicker'

const isoToday = () => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

describe('DatePicker', () => {
  test('muestra el placeholder cuando no hay valor', () => {
    render(<DatePicker id="desde" label="Desde" value="" onChange={vi.fn()} />)
    expect(screen.getByText('Elegir fecha')).toBeInTheDocument()
    expect(screen.getByLabelText('Desde')).toBeInTheDocument()
  })

  test('abre el popup con el calendario al hacer clic', async () => {
    const user = userEvent.setup()
    render(<DatePicker id="desde" label="Desde" value="" onChange={vi.fn()} />)

    await user.click(screen.getByLabelText('Desde'))
    expect(screen.getByRole('dialog', { name: 'Desde' })).toBeInTheDocument()
    expect(screen.getByText(/Lun/)).toBeInTheDocument()
  })

  test('emite la fecha seleccionada en formato ISO', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DatePicker id="desde" label="Desde" value="" onChange={onChange} />)

    await user.click(screen.getByLabelText('Desde'))

    const currentYear = new Date().getFullYear()
    const dayButtons = screen.getAllByRole('button').filter((b) => /^\d{1,2}$/.test(b.textContent ?? ''))
    const first = dayButtons[0]
    const iso = `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(
      Number(first.textContent),
    ).padStart(2, '0')}`
    await user.click(first)
    expect(onChange).toHaveBeenCalledWith(iso)
  })

  test('"Hoy" emite la fecha actual', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DatePicker id="desde" label="Desde" value="" onChange={onChange} />)

    await user.click(screen.getByLabelText('Desde'))
    await user.click(screen.getByRole('button', { name: 'Hoy' }))
    expect(onChange).toHaveBeenCalledWith(isoToday())
  })

  test('"Limpiar" emite valor vacío y solo aparece si hay valor', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DatePicker id="desde" label="Desde" value="2026-07-01" onChange={onChange} />)

    await user.click(screen.getByLabelText('Desde'))
    const clear = screen.getByRole('button', { name: 'Limpiar' })
    await user.click(clear)
    expect(onChange).toHaveBeenCalledWith('')
  })

  test('cierra el popup con Escape', async () => {
    const user = userEvent.setup()
    render(<DatePicker id="desde" label="Desde" value="" onChange={vi.fn()} />)

    await user.click(screen.getByLabelText('Desde'))
    expect(screen.getByRole('dialog', { name: 'Desde' })).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: 'Desde' })).not.toBeInTheDocument()
  })
})
