import { Link } from 'react-router-dom'
import { useAuth } from '../../providers/authentication/AuthContext'

export default function Home() {
  const { isAuthenticated } = useAuth()

  return (
    <div>
      <h1>Home</h1>
      {isAuthenticated ? (
        <Link to="/dashboard">Ir al Dashboard</Link>
      ) : (
        <>
          <Link to="/signin">Iniciar Sesión</Link>
          <br />
          <Link to="/signup">Registrarse</Link>
        </>
      )}
    </div>
  )
}
