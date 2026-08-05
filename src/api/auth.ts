import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  getIdToken,
  type User as FirebaseUser,
} from 'firebase/auth'
import { login as mockLogin, logout as mockLogout, register as mockRegister } from '../mocks/handlers/auth'
import { getUserById } from '../mocks/handlers/users'
import { provisionDemoData } from '../mocks/provision'
import { fetchApi, setAuthTokenGetter } from './fetchApi'
import { getFriendlyErrorMessage } from './errors'
import { auth } from '../firebase/firebase'
import type { User } from '../mocks/data/users'

const STORAGE_KEY = 'globalance.currentUserId'

export type AuthMode = 'mock' | 'firebase'

export function getAuthMode(): AuthMode {
  const override = import.meta.env.VITE_AUTH_MODE
  if (override === 'mock' || override === 'firebase') return override
  return import.meta.env.DEV ? 'mock' : 'firebase'
}

let cachedUser: User | null = null

export function getCachedUser(): User | null {
  return cachedUser
}

export function refreshCachedUser(user: User): void {
  cachedUser = user
}

export function getCurrentUserId(): string | null {
  return localStorage.getItem(STORAGE_KEY)
}

export function setCurrentUser(userId: string): void {
  localStorage.setItem(STORAGE_KEY, userId)
}

export function clearCurrentUser(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export async function getAuthToken(): Promise<string | null> {
  if (getAuthMode() === 'mock') return null
  const fb = auth
  if (!fb?.currentUser) return null
  return await getIdToken(fb.currentUser)
}

setAuthTokenGetter(getAuthToken)

// --- Firebase + API -----------------------------------------------------

interface ApiUser {
  id: string
  firebase_uid: string
  email: string
  user_type: 'person' | 'company' | null
  display_currency: string
  status: 'active' | 'inactive' | 'blocked'
  created_at: string
  last_access_at: string | null
}

interface SyncResponse {
  data: ApiUser | { user: ApiUser; wallet: unknown }
}

function mapUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    firebase_uid: apiUser.firebase_uid,
    email: apiUser.email,
    user_type: apiUser.user_type,
    display_currency: apiUser.display_currency,
    status: apiUser.status,
    created_at: apiUser.created_at,
    last_access_at: apiUser.last_access_at,
  }
}

function requireFirebase() {
  if (!auth) throw new Error('Firebase no configurado. Revisá las variables VITE_FIREBASE_* en .env')
  return auth
}

async function syncUser(token: string): Promise<User> {
  const body = await fetchApi<SyncResponse>('/auth/sync', { method: 'POST', token })
  const data = body.data
  const apiUser = 'wallet' in data ? data.user : data
  return mapUser(apiUser)
}

function getFirebaseErrorMessage(error: unknown): string {
  const code = (error as { code?: string }).code
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Correo o contraseña incorrectos'
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta con este correo'
    case 'auth/invalid-email':
      return 'Correo electrónico inválido'
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres'
    case 'auth/popup-closed-by-user':
      return 'Ventana de Google cerrada. Intentá de nuevo'
    case 'auth/cancelled-popup-request':
      return 'Solicitud cancelada'
    case 'auth/network-request-failed':
      return 'Sin conexión. Intentá de nuevo'
    default:
      return error instanceof Error ? error.message : 'Error de autenticación'
  }
}

function isFirebaseAuthError(error: unknown): boolean {
  const code = (error as { code?: unknown }).code
  return typeof code === 'string' && code.startsWith('auth/')
}

function getAuthErrorMessage(error: unknown): string {
  if (isFirebaseAuthError(error)) return getFirebaseErrorMessage(error)
  return getFriendlyErrorMessage(error)
}

function applySession(user: User): void {
  cachedUser = user
  setCurrentUser(user.id)
}

async function signInWithToken(firebaseUser: FirebaseUser): Promise<User> {
  const token = await getIdToken(firebaseUser)
  const user = await syncUser(token)
  applySession(user)
  return user
}

// --- Auth pública (mock o firebase según el modo) ------------------------

export async function login(email: string, password: string): Promise<User> {
  if (getAuthMode() === 'mock') {
    const user = await mockLogin(email)
    applySession(user)
    return user
  }
  try {
    const fb = requireFirebase()
    const credential = await signInWithEmailAndPassword(fb, email, password)
    return await signInWithToken(credential.user)
  } catch (error) {
    throw new Error(getAuthErrorMessage(error))
  }
}

export async function loginWithGoogle(): Promise<User> {
  if (getAuthMode() === 'mock') {
    throw new Error('El login con Google no está disponible en modo mock')
  }
  try {
    const fb = requireFirebase()
    const credential = await signInWithPopup(fb, new GoogleAuthProvider())
    return await signInWithToken(credential.user)
  } catch (error) {
    throw new Error(getAuthErrorMessage(error))
  }
}

export async function register(input: { fullName: string; email: string; password: string }): Promise<User> {
  if (getAuthMode() === 'mock') {
    const user = await mockRegister({ fullName: input.fullName, email: input.email })
    applySession(user)
    return user
  }
  try {
    const fb = requireFirebase()
    const credential = await createUserWithEmailAndPassword(fb, input.email, input.password)
    if (input.fullName) {
      await updateProfile(credential.user, { displayName: input.fullName })
    }
    return await signInWithToken(credential.user)
  } catch (error) {
    throw new Error(getAuthErrorMessage(error))
  }
}

export async function logout(): Promise<void> {
  if (getAuthMode() === 'mock') {
    await mockLogout()
  } else if (auth) {
    await signOut(auth)
  }
  cachedUser = null
  clearCurrentUser()
}

// --- Sesión / restauración -----------------------------------------------

export type AuthSessionListener = (user: User | null) => void

export function subscribeToAuth(listener: AuthSessionListener): () => void {
  if (getAuthMode() === 'mock') {
    void (async () => {
      const id = getCurrentUserId()
      const user = id ? await getUserById(id) : undefined
      if (user) {
        provisionDemoData(user.id, user.email.split('@')[0].replace(/[._-]+/g, ' ').trim())
      }
      listener(user ?? null)
    })()
    return () => {}
  }

  const fb = auth
  if (!fb) {
    listener(null)
    return () => {}
  }

  return onAuthStateChanged(fb, (firebaseUser) => {
    if (!firebaseUser) {
      cachedUser = null
      clearCurrentUser()
      listener(null)
      return
    }
    signInWithToken(firebaseUser)
      .then((user) => listener(user))
      .catch(() => listener(null))
  })
}
