import { createContext, useContext } from 'react'
import type { User } from '../../mocks/data/users'
import type { CompleteGoogleProfileInput } from '../../api/users'

export interface AuthContextValue {
  user: User | null
  initializing: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<'authenticated' | 'pending'>
  register: (input: { fullName: string; email: string; password: string; userType?: 'person' | 'company' }) => Promise<void>
  logout: () => Promise<void>
  completeGoogleProfile: (patch: CompleteGoogleProfileInput) => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
