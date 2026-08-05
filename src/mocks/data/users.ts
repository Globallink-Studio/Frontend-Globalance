export interface User {
  id: string
  firebase_uid: string
  email: string
  user_type: 'person' | 'company' | null
  display_currency: string
  status: 'active' | 'inactive' | 'blocked'
  created_at: string
  last_access_at: string | null
}

// Los usuarios ya no son datos estáticos: se crean automáticamente al iniciar
// sesión o registrarse (login mock), y cada uno recibe su wallet demo con
// saldos, tarjetas e historial (ver src/mocks/provision.ts).

export const users: User[] = []
