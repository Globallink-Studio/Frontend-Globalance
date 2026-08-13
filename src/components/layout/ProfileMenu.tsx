import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import { useAuth } from '../../providers/authentication/AuthContext'
import '../../styles/components/profile-menu.css'

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || 'U'
}

export default function ProfileMenu({ name }: { name: string }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()

  useEffect(() => {
    const close = (e: MouseEvent) => {
      const target = e.target as Node
      if (triggerRef.current?.contains(target)) return
      if (menuRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!open) return
    const onResize = () => {
      if (!triggerRef.current) return
      const r = triggerRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + 8, right: window.innerWidth - r.right })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [open])

  const toggle = () => {
    if (!open && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + 8, right: window.innerWidth - r.right })
    }
    setOpen((o) => !o)
  }

  const go = (to: string) => {
    setOpen(false)
    navigate(to)
  }

  const handleLogout = async () => {
    setOpen(false)
    await logout()
    navigate('/')
  }

  return (
    <div className="app-topbar__profile">
      <button
        type="button"
        className="app-topbar__avatar"
        onClick={toggle}
        aria-label="Abrir menú de perfil"
        aria-expanded={open}
        ref={triggerRef}
      >
        {getInitial(name)}
      </button>
      {open &&
        createPortal(
          <div
            className="profile-menu"
            role="menu"
            ref={menuRef}
            style={pos ? { top: pos.top, right: pos.right } : undefined}
          >
            <button type="button" role="menuitem" className="profile-menu__item btn-hover-edit" onClick={() => go('/dashboard/profile')}>
              <User className="profile-menu__icon" />
              Ver perfil
            </button>
            <div className="profile-menu__divider" role="separator" />
            <button type="button" role="menuitem" className="profile-menu__item profile-menu__item--danger btn-hover-danger" onClick={handleLogout}>
              <LogOut className="profile-menu__icon" />
              Cerrar sesión
            </button>
          </div>,
          document.body,
        )}
    </div>
  )
}
