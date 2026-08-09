import { useNavigate } from 'react-router-dom'
import { ArrowLeftRight, Bell, BookUser, CreditCard, Search, Wallet } from 'lucide-react'
import type { SearchSection, SearchSectionKey } from '../../api/search'

const sectionIcon: Record<SearchSectionKey, typeof Search> = {
  contacts: BookUser,
  transactions: ArrowLeftRight,
  wallet: Wallet,
  cards: CreditCard,
  notifications: Bell,
}

export default function SearchResults({
  sections,
  onNavigate,
}: {
  sections: SearchSection[]
  onNavigate?: () => void
}) {
  const navigate = useNavigate()

  return (
    <div className="search-results">
      {sections.map((section) => {
        const Icon = sectionIcon[section.key]
        return (
          <div key={section.key} className="search-results__section">
            <div className="search-results__head">
              <span className="search-results__label">
                <Icon className="search-results__icon" />
                {section.label}
                <span className="search-results__count">{section.total}</span>
              </span>
            </div>
            {section.hits.map((hit) => (
              <button
                key={hit.id}
                type="button"
                className="search-results__item"
                onClick={() => {
                  onNavigate?.()
                  navigate(hit.to, hit.state ? { state: hit.state } : undefined)
                }}
              >
                <span className="search-results__title">{hit.title}</span>
                <span className="search-results__subtitle">{hit.subtitle}</span>
              </button>
            ))}
          </div>
        )
      })}
    </div>
  )
}
