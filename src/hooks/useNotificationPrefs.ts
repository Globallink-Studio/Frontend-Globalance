import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'globalance:notification-prefs'
const EVENT = 'globalance:notification-prefs-change'

export function getNotificationPrefsEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'false'
  } catch {
    return true
  }
}

export function setNotificationPrefsEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(enabled))
    window.dispatchEvent(new CustomEvent(EVENT, { detail: { enabled } }))
  } catch {
    // noop
  }
}

export function useNotificationPrefs() {
  const [enabled, setEnabled] = useState<boolean>(getNotificationPrefsEnabled)

  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<{ enabled: boolean }>).detail
      if (detail) setEnabled(detail.enabled)
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setEnabled(e.newValue !== 'false')
    }
    window.addEventListener(EVENT, onChange)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(EVENT, onChange)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const update = useCallback((value: boolean) => setNotificationPrefsEnabled(value), [])

  return { enabled, setEnabled: update }
}
