import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import TermsContent from './TermsContent'
import '../../../styles/pages/private/profile.css'

export default function TermsAndConditions() {
  return (
    <div className="profile-page">
      <Link to="/dashboard/profile" className="profile-edit__back">
        <ArrowLeft className="h-4 w-4" />
        Volver al perfil
      </Link>
      <div className="profile-card mt-4">
        <h2 className="profile-card__title">Términos y Condiciones</h2>
        <p className="profile-info-row__label">
          Última actualización: 10 de agosto de 2026
        </p>
        <div className="pt-4">
          <TermsContent />
        </div>
      </div>
    </div>
  )
}
