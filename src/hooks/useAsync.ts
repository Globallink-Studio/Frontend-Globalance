import { useEffect, useState } from 'react'
import type { FetchState } from '../api/fetchState'

export function useAsync<T>(fn: () => Promise<T>) {
  const [state, setState] = useState<FetchState>('idle')
  const [data, setData] = useState<T | undefined>(undefined)
  const [error, setError] = useState('')

  useEffect(() => {
    setState('loading')
    fn()
      .then((result) => {
        setData(result)
        setState('success')
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Error inesperado')
        setState('error')
      })
  }, [fn])

  return { state, data, error }
}
