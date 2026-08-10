import '../styles/components/pagination.css'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav className="pagination" aria-label="Paginación">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onPageChange(n)}
          className={`pagination__chip${page === n ? ' pagination__chip--active' : ''}`}
          aria-label={`Página ${n}`}
          aria-current={page === n ? 'page' : undefined}
        >
          {n}
        </button>
      ))}
    </nav>
  )
}
