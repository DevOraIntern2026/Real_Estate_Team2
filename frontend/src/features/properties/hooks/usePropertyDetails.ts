import { useEffect, useState } from 'react'
import { fetchPropertyDetails } from '../mocks/mockData'
import type { PropertyDetailsData } from '../types/types'

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: PropertyDetailsData }

export function usePropertyDetails(id: string): State {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ status: 'loading' })
    fetchPropertyDetails(id)
      .then((data) => !cancelled && setState({ status: 'success', data }))
      .catch(
        (err: unknown) =>
          !cancelled &&
          setState({
            status: 'error',
            message:
              err instanceof Error ? err.message : 'Something went wrong',
          }),
      )
    return () => {
      cancelled = true
    }
  }, [id])

  return state
}
