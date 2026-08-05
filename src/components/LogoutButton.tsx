import { useNavigate } from 'react-router-dom'
import { useAuth } from '../providers/authentication/AuthContext'
import '../styles/components/logout-button.css'

export default function LogoutButton() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <button type="button" className="logout-button" onClick={handleLogout}>
      Cerrar sesión
    </button>
  )
}
