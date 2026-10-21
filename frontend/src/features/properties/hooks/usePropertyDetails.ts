import { useEffect, useState } from 'react'
import { getPropertyDetails } from '../services/api'
import type { PropertyData } from '../types/types'

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: PropertyData }

export function usePropertyDetails(id: string): State {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ status: 'loading' })
    if (!id) {
      setState({ status: 'error', message: 'A property ID is required to load its details.' })
      return () => { cancelled = true }
    }
    getPropertyDetails(id)
      .then((data) => {
        if (!cancelled) {
          setState({ status: 'success', data })
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            status: 'error',
            message:
              err instanceof Error ? err.message : 'Something went wrong',
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [id])

  return state
}
