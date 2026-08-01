import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div>
      <h1>Home</h1>
      <Link to="/dashboard">Ir al Dashboard</Link>
      <br />
      <Link to="/signin">Iniciar Sesión</Link>
      <br />
      <Link to="/signup">Registrarse</Link>
    </div>
  )
}
