const KEY_PREFIX = 'globalance.profileCompleted.'

export function profileCompletedKey(uid: string): string {
  return `${KEY_PREFIX}${uid}`
}

export function isProfileCompleted(uid: string): boolean {
  return localStorage.getItem(profileCompletedKey(uid)) === '1'
}

export function markProfileCompleted(uid: string): void {
  localStorage.setItem(profileCompletedKey(uid), '1')
}
