export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

export function getExpiryError(value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return 'El vencimiento es obligatorio.'
  const match = /^(\d{2})\/(\d{2})$/.exec(trimmed)
  if (!match) return 'El vencimiento debe tener formato MM/AA.'
  const month = Number(match[1])
  if (month < 1 || month > 12) return 'El mes debe estar entre 01 y 12.'
  const year = 2000 + Number(match[2])
  const lastDayOfExpiryMonth = new Date(year, month, 0, 23, 59, 59, 999)
  if (lastDayOfExpiryMonth.getTime() < Date.now()) return 'La tarjeta está vencida.'
  return undefined
}
