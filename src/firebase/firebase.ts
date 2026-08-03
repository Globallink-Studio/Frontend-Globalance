import { initializeApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'

const env = import.meta.env

export const auth: Auth | undefined =
  env.VITE_FIREBASE_API_KEY &&
  env.VITE_FIREBASE_AUTH_DOMAIN &&
  env.VITE_FIREBASE_PROJECT_ID &&
  env.VITE_FIREBASE_APP_ID
    ? getAuth(
        initializeApp({
          apiKey: env.VITE_FIREBASE_API_KEY,
          authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId: env.VITE_FIREBASE_PROJECT_ID,
          appId: env.VITE_FIREBASE_APP_ID,
        }),
      )
    : undefined

export function isFirebaseConfigured(): boolean {
  return Boolean(auth)
}
