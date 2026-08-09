import { useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Search, X } from 'lucide-react'
import { searchGlobal, type SearchData } from '../../api/search'
import SearchResults from './SearchResults'
import '../../styles/components/search.css'

const RESULTS_PER_SECTION = 10

export default function SearchModal({
  open,
  data,
  query,
  onQueryChange,
  onClose,
}: {
  open: boolean
  data: SearchData | null
  query: string
  onQueryChange: (q: string) => void
  onClose: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const sections = useMemo(
    () => (data ? searchGlobal(data, query, RESULTS_PER_SECTION) : []),
    [data, query],
  )

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="search-modal" onClick={onClose}>
      <div className="search-modal__dialog" onClick={(e) => e.stopPropagation()}>
        <div className="search-modal__input">
          <Search className="search-modal__input-icon" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Buscar contactos, transacciones, tarjetas..."
            className="search-modal__input-field"
            aria-label="Buscar en todo"
          />
          <button
            type="button"
            className="search-modal__close"
            onClick={onClose}
            aria-label="Cerrar búsqueda"
          >
            <X className="search-modal__close-icon" />
          </button>
        </div>
        <div className="search-modal__body">
          {query.trim().length < 2 ? (
            <p className="search-modal__empty">Escribí al menos 2 caracteres para buscar en todo Globalance.</p>
          ) : sections.length === 0 ? (
            <p className="search-modal__empty">Sin resultados para «{query}».</p>
          ) : (
            <SearchResults sections={sections} onNavigate={onClose} />
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
