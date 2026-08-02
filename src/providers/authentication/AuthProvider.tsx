import { useEffect, useState, type ReactNode } from 'react'
import { AuthContext, type AuthContextValue } from './AuthContext'
import { login as apiLogin, logout as apiLogout, register as apiRegister } from '../../api/auth'
import { getCurrentUser } from '../../api/users'
import type { User } from '../../mocks/data/users'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    getCurrentUser()
      .then((u) => setUser(u ?? null))
      .finally(() => setInitializing(false))
  }, [])

  const login = async (email: string) => {
    const u = await apiLogin(email)
    setUser(u)
  }

  const register = async (input: { fullName: string; email: string }) => {
    const u = await apiRegister(input)
    setUser(u)
  }

  const logout = async () => {
    await apiLogout()
    setUser(null)
  }

  const value: AuthContextValue = { user, initializing, isAuthenticated: !!user, login, register, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
