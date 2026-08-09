export type NotificationType = 'transfer' | 'deposit' | 'request' | 'conversion' | 'withdrawal' | 'info'

export interface AppNotification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  created_at: string
  link?: string
}

export const notifications: AppNotification[] = [
  {
    id: '40000000-0000-4000-8000-000000000001',
    user_id: '11111111-1111-4111-8111-111111111111',
    type: 'deposit',
    title: 'Depósito acreditado',
    message: 'Tu depósito de sueldo por $50.000 fue acreditado en tu cuenta.',
    read: false,
    created_at: '2026-07-28T09:05:00.000Z',
  },
  {
    id: '40000000-0000-4000-8000-000000000002',
    user_id: '11111111-1111-4111-8111-111111111111',
    type: 'request',
    title: 'Solicitud de dinero',
    message: 'Juan Pérez te solicitó $12.000.',
    read: false,
    created_at: '2026-07-28T11:30:00.000Z',
  },
  {
    id: '40000000-0000-4000-8000-000000000003',
    user_id: '11111111-1111-4111-8111-111111111111',
    type: 'conversion',
    title: 'Conversión completada',
    message: 'Convertiste USD 250 a $225.500 a la tasa de referencia.',
    read: true,
    created_at: '2026-07-29T14:15:00.000Z',
  },
  {
    id: '40000000-0000-4000-8000-000000000004',
    user_id: '11111111-1111-4111-8111-111111111111',
    type: 'info',
    title: 'Bienvenida a Globalance',
    message: 'Tu cuenta está lista. Configurá tu perfil y agregá tus métodos de pago.',
    read: true,
    created_at: '2026-07-27T08:00:00.000Z',
  },
]
