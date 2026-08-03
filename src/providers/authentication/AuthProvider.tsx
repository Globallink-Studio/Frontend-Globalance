import { useEffect, useState, type ReactNode } from 'react'
import { AuthContext, type AuthContextValue } from './AuthContext'
import {
  login as apiLogin,
  loginWithGoogle as apiLoginWithGoogle,
  logout as apiLogout,
  register as apiRegister,
  subscribeToAuth,
} from '../../api/auth'
import type { User } from '../../mocks/data/users'

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

  const loginWithGoogle = async () => {
    const u = await apiLoginWithGoogle()
    setUser(u)
  }

  const register = async (input: { fullName: string; email: string; password: string }) => {
    const u = await apiRegister(input)
    setUser(u)
  }

  const logout = async () => {
    await apiLogout()
    setUser(null)
  }

  const value: AuthContextValue = { user, initializing, isAuthenticated: !!user, login, loginWithGoogle, register, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
