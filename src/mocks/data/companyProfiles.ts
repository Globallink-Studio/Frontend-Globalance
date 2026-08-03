export interface CompanyProfile {
  user_id: string
  legal_name: string
  document: string
  phone: string | null
}

export const companyProfiles: CompanyProfile[] = [
  {
    user_id: '55555555-5555-4555-8555-555555555555',
    legal_name: 'Globallink Studio S.R.L.',
    document: 'CUIT 30-71234567-8',
    phone: '+54 11 5555-0201',
  },
  {
    user_id: '66666666-6666-4666-8666-666666666666',
    legal_name: 'Estudio Crea S.A.',
    document: 'CUIT 30-72345678-9',
    phone: '+54 11 5555-0202',
  },
]
