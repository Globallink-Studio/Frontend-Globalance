import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Pagination from '../../src/components/Pagination'

describe('Pagination', () => {
  test('no renderiza nada si hay una sola página', () => {
    const { container } = render(<Pagination page={1} totalPages={1} onPageChange={vi.fn()} />)
    expect(container.querySelector('.pagination')).toBeNull()
  })

  test('renderiza un botón por página y marca la activa', () => {
    render(<Pagination page={2} totalPages={3} onPageChange={vi.fn()} />)
    expect(screen.getByRole('navigation', { name: 'Paginación' })).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(3)
    expect(screen.getByRole('button', { name: 'Página 2' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Página 1' })).not.toHaveAttribute('aria-current')
  })

  test('llama onPageChange con el número de la página al hacer clic', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(<Pagination page={1} totalPages={3} onPageChange={onPageChange} />)

    await user.click(screen.getByRole('button', { name: 'Página 3' }))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })
})
