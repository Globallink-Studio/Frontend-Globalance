import { useState } from 'react'
import { AuthModal } from './AuthModal'
import TermsContent from '../../pages/private/profile/TermsContent'
import PrivacyPolicyContent from '../../pages/private/profile/PrivacyPolicyContent'
import '../../styles/pages/public/signup.css'

interface LegalConsentProps {
  termsChecked: boolean
  privacyChecked: boolean
  onTermsChange: (checked: boolean) => void
  onPrivacyChange: (checked: boolean) => void
}

const LEGAL_UPDATED = 'Última actualización: 10 de agosto de 2026'

export default function LegalConsent({
  termsChecked,
  privacyChecked,
  onTermsChange,
  onPrivacyChange,
}: LegalConsentProps) {
  const [modal, setModal] = useState<'terms' | 'privacy' | null>(null)

  return (
    <>
      <div className="legal-consent" id="legal-consent">
        <label className="legal-consent__item">
          <input
            type="checkbox"
            className="legal-consent__checkbox"
            checked={termsChecked}
            onChange={(e) => onTermsChange(e.target.checked)}
          />
          <span>
            He leído y acepto los{' '}
            <button type="button" className="legal-consent__link" onClick={() => setModal('terms')}>
              Términos y Condiciones
            </button>
          </span>
        </label>

        <label className="legal-consent__item">
          <input
            type="checkbox"
            className="legal-consent__checkbox"
            checked={privacyChecked}
            onChange={(e) => onPrivacyChange(e.target.checked)}
          />
          <span>
            He leído y acepto la{' '}
            <button type="button" className="legal-consent__link" onClick={() => setModal('privacy')}>
              Política de Privacidad
            </button>
          </span>
        </label>
      </div>

      <AuthModal
        open={modal === 'terms'}
        onClose={() => setModal(null)}
        title="Términos y Condiciones"
        subtitle={LEGAL_UPDATED}
      >
        <div className="legal-consent__content">
          <TermsContent />
        </div>
      </AuthModal>

      <AuthModal
        open={modal === 'privacy'}
        onClose={() => setModal(null)}
        title="Política de Privacidad"
        subtitle={LEGAL_UPDATED}
      >
        <div className="legal-consent__content">
          <PrivacyPolicyContent />
        </div>
      </AuthModal>
    </>
  )
}
