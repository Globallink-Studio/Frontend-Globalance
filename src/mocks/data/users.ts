export interface User {
  id: string
  firebase_uid: string
  email: string
  user_type: 'person' | 'company'
  display_currency: string
  status: 'active' | 'inactive' | 'blocked'
  created_at: string
  last_access_at: string | null
}

// Cambio de usuario mock (sin login): abrir consola (F12) y ejecutar:
// localStorage.setItem('globalance.currentUserId', '<id>') y luego location.reload()
// 11111111-1111-4111-8111-111111111111  Sofía Martínez       (person, activa)
// 22222222-2222-4222-8222-222222222222  Juan Pérez           (person, activo)
// 33333333-3333-4333-8333-333333333333  Camila Gómez         (person, activa)
// 44444444-4444-4444-8444-444444444444  Martín Rodríguez     (person, inactivo)
// 55555555-5555-4555-8555-555555555555  Globallink Studio    (company, activa)
// 66666666-6666-4666-8666-666666666666  Estudio Crea         (company, inactiva)

export const users: User[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    firebase_uid: 'xQk9nL4mW8sT2vR6pY1cZ3bN7aH5dJ0e',
    email: 'sofia.martinez@example.com',
    user_type: 'person',
    display_currency: 'ARS',
    status: 'active',
    created_at: '2026-01-15T10:00:00.000Z',
    last_access_at: '2026-07-30T18:22:00.000Z',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    firebase_uid: 'mP3sD7gF1qZ5xR9wE2tY6uI4oA8bC0v',
    email: 'juan.perez@example.com',
    user_type: 'person',
    display_currency: 'USD',
    status: 'active',
    created_at: '2026-02-20T09:30:00.000Z',
    last_access_at: '2026-07-29T14:05:00.000Z',
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    firebase_uid: 'tR6vY2nH9jM1kL5pQ8wS3xZ7cV4bN0m',
    email: 'camila.gomez@example.com',
    user_type: 'person',
    display_currency: 'EUR',
    status: 'active',
    created_at: '2026-03-10T16:45:00.000Z',
    last_access_at: '2026-07-28T11:12:00.000Z',
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    firebase_uid: 'gH4jK8lD2fS6aA9qW1eR5tY7uI0oP3n',
    email: 'martin.rodriguez@example.com',
    user_type: 'person',
    display_currency: 'ARS',
    status: 'inactive',
    created_at: '2025-11-05T08:00:00.000Z',
    last_access_at: '2026-05-02T20:40:00.000Z',
  },
  {
    id: '55555555-5555-4555-8555-555555555555',
    firebase_uid: 'cV7bN1mQ5wE9rT2yU6iO0pA3sD8fG4j',
    email: 'contacto@globallinkstudio.com',
    user_type: 'company',
    display_currency: 'USD',
    status: 'active',
    created_at: '2026-01-30T12:00:00.000Z',
    last_access_at: '2026-07-31T09:15:00.000Z',
  },
  {
    id: '66666666-6666-4666-8666-666666666666',
    firebase_uid: 'zX5cV3bN7mQ1wE9rT2yU6iO0pA3sD8f',
    email: 'info@estudiocrea.com',
    user_type: 'company',
    display_currency: 'ARS',
    status: 'inactive',
    created_at: '2025-12-01T10:30:00.000Z',
    last_access_at: '2026-04-15T17:55:00.000Z',
  },
]
