import { createContext, useContext } from 'react'
import type { User } from '../../mocks/data/users'

export interface AuthContextValue {
  user: User | null
  initializing: boolean
  isAuthenticated: boolean
  login: (email: string) => Promise<void>
  register: (input: { fullName: string; email: string }) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
