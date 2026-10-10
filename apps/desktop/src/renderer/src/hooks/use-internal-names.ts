import { useCallback, useState } from 'react'

const storageKey = 'nms-courier.internal-names'

// Whether the interface shows the game's internal names (identifiers, the raw answer of the
// bridge) beside what a player reads. Off unless the user asked for them in the settings.
export function readInternalNames(): boolean {
  return window.localStorage.getItem(storageKey) === 'on'
}

// Elements with the class "internal-name" are hidden by the stylesheet while this is off.
function apply(shown: boolean): void {
  document.documentElement.dataset.internalNames = shown ? 'on' : 'off'
}

apply(readInternalNames())

export function useInternalNames(): [boolean, (next: boolean) => void] {
  const [shown, setShown] = useState(readInternalNames)
  const update = useCallback((next: boolean) => {
    window.localStorage.setItem(storageKey, next ? 'on' : 'off')
    apply(next)
    setShown(next)
  }, [])
  return [shown, update]
}
