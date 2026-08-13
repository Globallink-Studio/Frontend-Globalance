export const DEPOSIT_LIMITS: Record<string, number> = {
  ARS: 10_000_000,
  EUR: 10_000,
  USD: 10_000,
}

export const MAX_TRANSACTIONS_PER_DAY = 30

export function formatDepositLimit(currency: string): string {
  const limit = DEPOSIT_LIMITS[currency]
  return limit === undefined ? '' : `${limit.toLocaleString('es-AR')} ${currency}`
}
