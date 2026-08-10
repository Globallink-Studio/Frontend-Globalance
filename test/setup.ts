import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

vi.mock('../src/mocks/delay', () => ({ delay: () => Promise.resolve() }))

afterEach(() => {
  cleanup()
})
