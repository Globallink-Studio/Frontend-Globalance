const ALIAS_CHARSET = 'abcdefghijklmnopqrstuvwxyz0123456789'

function randomAliasSuffix(length: number): string {
  let out = ''
  for (let i = 0; i < length; i++) {
    out += ALIAS_CHARSET[Math.floor(Math.random() * ALIAS_CHARSET.length)]
  }
  return out
}

export function generateAlias(firstName: string, lastName: string): string {
  const base = `${firstName}.${lastName}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
  const candidate = `${base || 'usuario'}.${randomAliasSuffix(4)}`
  const trimmed = candidate.replace(/\.{2,}/g, '.').replace(/^\.+|\.+$/g, '').slice(0, 30)
  return trimmed.length >= 6 ? trimmed : trimmed + randomAliasSuffix(6 - trimmed.length)
}
