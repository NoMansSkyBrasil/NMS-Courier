import { useEffect, useState } from 'react'

// The window's location hash, kept current. Pages are addressed as "#<feature id>".
export function useHashRoute(): string {
  const [hash, setHash] = useState(window.location.hash)

  useEffect(() => {
    const update = (): void => setHash(window.location.hash)
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])

  return hash
}
