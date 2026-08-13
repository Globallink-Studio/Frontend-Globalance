import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeftRight, Banknote, HandCoins, RefreshCw, Info, X } from 'lucide-react'
import { useNotifications } from '../../hooks/useNotifications'
import { useNotificationPrefs } from '../../hooks/useNotificationPrefs'
import type { NotificationType } from '../../mocks/data/notifications'
import '../../styles/components/notifications.css'

const typeIcon: Record<NotificationType, typeof Info> = {
  transfer: ArrowLeftRight,
  deposit: Banknote,
  request: HandCoins,
  conversion: RefreshCw,
  withdrawal: Banknote,
  info: Info,
}

const dayLabel = (iso: string) => {
  const d = new Date(iso)
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()
  if (d.toDateString() === today) return 'Hoy'
  if (d.toDateString() === yesterday) return 'Ayer'
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

export default function NotificationsList({ fromBell = false }: { fromBell?: boolean } = {}) {
  const { notifications, unreadCount, markRead, remove, markAllRead } = useNotifications()
  const { enabled } = useNotificationPrefs()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const navigate = useNavigate()
  const location = useLocation()
  const openedId = (location.state as { openedId?: string } | null)?.openedId ?? null
  const [flashId, setFlashId] = useState<string | null>(openedId)

  useEffect(() => {
    if (fromBell || !openedId) return
    setFlashId(openedId)
    navigate(location.pathname, { replace: true, state: null })
  }, [openedId, location.pathname, navigate, fromBell])

  useEffect(() => {
    if (fromBell || !flashId) return
    const el = document.getElementById(`notification-${flashId}`)
    const scroll = window.setTimeout(() => {
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 150)
    const clear = window.setTimeout(() => setFlashId(null), 2200)
    return () => {
      window.clearTimeout(scroll)
      window.clearTimeout(clear)
    }
  }, [flashId, fromBell])

  const shown = fromBell && !enabled ? [] : notifications
  const visible = shown.filter((n) => filter === 'all' || !n.read)
  const limited = fromBell ? visible.slice(0, 5) : visible

  const groups = limited.reduce<{ label: string; items: typeof limited }[]>((acc, n) => {
    const label = dayLabel(n.created_at)
    const last = acc[acc.length - 1]
    if (last && last.label === label) last.items.push(n)
    else acc.push({ label, items: [n] })
    return acc
  }, [])

  const open = (n: { read: boolean; link?: string; id: string }) => {
    if (!n.read) void markRead(n.id)
    if (!fromBell && n.link) {
      navigate(n.link)
    }
  }

  return (
    <div className="notifications-page">
      <div className="notifications-page__toolbar">
        <div className="notifications-page__filters" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'all'}
            className={`notifications-filter${filter === 'all' ? ' notifications-filter--active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todas
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'unread'}
            className={`notifications-filter${filter === 'unread' ? ' notifications-filter--active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            No leídas
          </button>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            className="notifications-page__markall"
            onClick={() => void markAllRead()}
          >
            Marcar todas
          </button>
        )}
      </div>

      <div className="notifications-list">
        {groups.length === 0 ? (
          <div className="notifications-list__empty">
            {fromBell && !enabled
              ? 'Las notificaciones están desactivadas en tus preferencias.'
              : filter === 'unread'
                ? 'No tienes notificaciones sin leer.'
                : 'No tienes notificaciones.'}
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.label} className="notifications-list__group">
              <div className="notifications-list__day">{group.label}</div>
              {group.items.map((n) => {
                const Icon = typeIcon[n.type]
                return (
                  <div
                    key={n.id}
                    id={`notification-${n.id}`}
                    className={`notifications-item${n.read ? '' : ' notifications-item--unread'}${n.id === flashId ? ' notifications-item--flash' : ''}`}
                  >
                    <span className={`notifications-item__icon notifications-item__icon--${n.type}`}>
                      <Icon className="notifications-item__icon-svg" />
                    </span>
                    <button type="button" className="notifications-item__main" onClick={() => open(n)}>
                      <span className="notifications-item__title">{n.title}</span>
                      <span className="notifications-item__message">{n.message}</span>
                      <span className="notifications-item__date">{formatDate(n.created_at)}</span>
                    </button>
                    <button
                      type="button"
                      className="notifications-item__close"
                      aria-label="Eliminar notificación"
                      onClick={() => void remove(n.id)}
                    >
                      <X className="notifications-item__close-icon" />
                    </button>
                  </div>
                )
              })}
            </div>
          ))
        )}
      </div>

      {fromBell && (
        <button
          type="button"
          className="notifications-panel__footer"
          onClick={() => navigate('/dashboard/notifications')}
        >
          Ver todas
        </button>
      )}
    </div>
  )
}
