export interface Currency {
  code: string
  name: string
  symbol: string
  decimal_places: number
  active: boolean
}

export const currencies: Currency[] = [
  { code: 'ARS', name: 'Peso argentino', symbol: '$', decimal_places: 2, active: true },
  { code: 'USD', name: 'Dólar estadounidense', symbol: 'US$', decimal_places: 2, active: true },
  { code: 'EUR', name: 'Euro', symbol: '€', decimal_places: 2, active: true },
]
