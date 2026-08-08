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

// Los usuarios de la app real ya no son datos estáticos: se crean automáticamente
// al iniciar sesión o registrarse (login mock), y cada uno recibe su wallet demo
// con saldos, tarjetas e historial (ver src/mocks/provision.ts).
//
// ACÁ abajo están los usuarios de referencia para el "directorio demo": existen
// para que las validaciones de contactos (email → usuario, cuenta → wallet,
// moneda → balances) tengan contra quién validar en modo mock. Los siembra
// provisionDemoDirectory() en src/mocks/provision.ts.

export const users: User[] = [
  {
    id: '22222222-2222-4222-8222-222222222222',
    firebase_uid: 'mock_juan',
    email: 'juan@ejemplo.com',
    user_type: 'person',
    display_currency: 'ARS',
    status: 'active',
    created_at: '2026-01-15T10:05:00.000Z',
    last_access_at: null,
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    firebase_uid: 'mock_camila',
    email: 'camila@ejemplo.com',
    user_type: 'person',
    display_currency: 'EUR',
    status: 'active',
    created_at: '2026-03-10T16:50:00.000Z',
    last_access_at: null,
  },
]
