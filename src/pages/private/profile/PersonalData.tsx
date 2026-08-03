import { useEffect, useState } from 'react'
import { getCurrentUser, getCurrentUserProfile } from '../../../api/users'
import type { User } from '../../../mocks/data/users'
import type { PersonProfile } from '../../../mocks/data/personProfiles'
import type { CompanyProfile } from '../../../mocks/data/companyProfiles'

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-2 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

export default function PersonalData() {
  const [user, setUser] = useState<User | undefined>()
  const [profile, setProfile] = useState<PersonProfile | CompanyProfile | undefined>()

  useEffect(() => {
    getCurrentUser().then(setUser)
    getCurrentUserProfile().then(setProfile)
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Datos personales</h1>

      {user && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold text-gray-700">Cuenta</h2>
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Tipo de usuario" value={user.user_type ?? 'Sin definir'} />
          <InfoRow label="Moneda de visualización" value={user.display_currency} />
          <InfoRow label="Estado" value={user.status} />
        </div>
      )}

      {profile && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold text-gray-700">
            {user?.user_type === 'company' ? 'Empresa' : 'Información personal'}
          </h2>
          {'first_name' in profile ? (
            <>
              <InfoRow label="Nombre" value={`${profile.first_name} ${profile.last_name}`} />
              <InfoRow label="Documento" value={profile.document} />
              <InfoRow label="Teléfono" value={profile.phone ?? '-'} />
            </>
          ) : (
            <>
              <InfoRow label="Razón social" value={profile.legal_name} />
              <InfoRow label="CUIT" value={profile.document} />
              <InfoRow label="Teléfono" value={profile.phone ?? '-'} />
            </>
          )}
        </div>
      )}
    </div>
  )
}
