import type { ReactNode } from 'react'
import type { FetchState } from '../api/fetchState'

interface AsyncStateProps {
  state: FetchState
  error?: string
  children: ReactNode
}

export default function AsyncState({ state, error, children }: AsyncStateProps) {
  if (state === 'loading') return <p className="text-sm text-gray-500">Cargando...</p>
  if (state === 'error') return <p className="text-sm text-red-600">Error: {error}</p>
  return <>{children}</>
}
