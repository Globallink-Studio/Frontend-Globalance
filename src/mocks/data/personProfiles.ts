export interface PersonProfile {
  user_id: string
  first_name: string
  last_name: string
  document: string
  phone: string | null
}

export const personProfiles: PersonProfile[] = [
  {
    user_id: '11111111-1111-4111-8111-111111111111',
    first_name: 'Sofía',
    last_name: 'Martínez',
    document: 'DNI 30123456',
    phone: '+54 11 5555-0101',
  },
  {
    user_id: '22222222-2222-4222-8222-222222222222',
    first_name: 'Juan',
    last_name: 'Pérez',
    document: 'DNI 32123456',
    phone: '+54 11 5555-0102',
  },
  {
    user_id: '33333333-3333-4333-8333-333333333333',
    first_name: 'Camila',
    last_name: 'Gómez',
    document: 'DNI 34123456',
    phone: '+54 11 5555-0103',
  },
  {
    user_id: '44444444-4444-4444-8444-444444444444',
    first_name: 'Martín',
    last_name: 'Rodríguez',
    document: 'DNI 35123456',
    phone: null,
  },
]
