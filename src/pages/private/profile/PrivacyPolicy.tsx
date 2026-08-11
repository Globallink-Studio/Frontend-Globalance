import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PrivacyPolicyContent from './PrivacyPolicyContent'
import '../../../styles/pages/private/profile.css'

export default function PrivacyPolicy() {
  return (
    <div className="profile-page">
      <Link to="/dashboard/profile" className="profile-edit__back">
        <ArrowLeft className="h-4 w-4" />
        Volver al perfil
      </Link>
      <div className="profile-card mt-4">
        <h2 className="profile-card__title">Política de Privacidad</h2>
        <p className="profile-info-row__label">
          Última actualización: 10 de agosto de 2026
        </p>
        <div className="pt-4">
          <PrivacyPolicyContent />
        </div>
      </div>
    </div>
  )
}
