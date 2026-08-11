import '../../styles/components/app-footer.css'

export default function AppFooter() {
  return (
    <footer className="app-footer">
      <p className="app-footer__copyright">
        © {new Date().getFullYear()} Globalance. Todos los derechos reservados.
      </p>
    </footer>
  )
}
