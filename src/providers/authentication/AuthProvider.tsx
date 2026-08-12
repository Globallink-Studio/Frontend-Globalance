import { useEffect, useState, type ReactNode } from 'react'
import { AuthContext, type AuthContextValue } from './AuthContext'
import {
  login as apiLogin,
  loginWithGoogle as apiLoginWithGoogle,
  logout as apiLogout,
  register as apiRegister,
  subscribeToAuth,
} from '../../api/auth'
import { completeGoogleProfile as apiCompleteGoogleProfile } from '../../api/users'
import type { User } from '../../mocks/data/users'
import type { CompleteGoogleProfileInput } from '../../api/users'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    const unsubscribe = subscribeToAuth((u) => {
      setUser(u)
      setInitializing(false)
    })
    return unsubscribe
  }, [])

  const login = async (email: string, password: string) => {
    const u = await apiLogin(email, password)
    setUser(u)
  }

  const loginWithGoogle = async (): Promise<'authenticated' | 'pending'> => {
    const result = await apiLoginWithGoogle()
    if (result.status === 'authenticated') setUser(result.user)
    return result.status
  }

  const register = async (input: { fullName: string; email: string; password: string; userType?: 'person' | 'company' }) => {
    const u = await apiRegister(input)
    setUser(u)
  }

  const logout = async () => {
    setInitializing(true)
    try {
      await apiLogout()
    } finally {
      setUser(null)
      setInitializing(false)
    }
  }

  const completeGoogleProfile = async (patch: CompleteGoogleProfileInput) => {
    const u = await apiCompleteGoogleProfile(patch)
    if (u) setUser(u)
  }

  const value: AuthContextValue = {
    user,
    initializing,
    isAuthenticated: !!user,
    login,
    loginWithGoogle,
    register,
    logout,
    completeGoogleProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
