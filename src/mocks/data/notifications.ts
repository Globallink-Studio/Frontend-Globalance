export interface AppNotification {
  id: string
  user_id: string
  title: string
  message: string
  read: boolean
  created_at: string
}

export const notifications: AppNotification[] = [
  {
    id: '40000000-0000-4000-8000-000000000001',
    user_id: '11111111-1111-4111-8111-111111111111',
    title: 'Depósito acreditado',
    message: 'Tu depósito de sueldo por $50.000 fue acreditado en tu cuenta.',
    read: false,
    created_at: '2026-07-28T09:05:00.000Z',
  },
]
