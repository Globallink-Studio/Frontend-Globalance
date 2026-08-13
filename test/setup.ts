import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

delete (import.meta.env as Record<string, string | undefined>).VITE_AUTH_MODE

vi.mock('../src/mocks/delay', () => ({ delay: () => Promise.resolve() }))

afterEach(() => {
  cleanup()
})
