import { useCallback, useState } from 'react'

const storageKey = 'nms-courier.notify'

// Whether deliveries let the game show its own notifications. On unless the user chose silence.
export function readNotifyPreference(): boolean {
  return window.localStorage.getItem(storageKey) !== 'off'
}

export function useNotifyPreference(): [boolean, (next: boolean) => void] {
  const [notify, setNotify] = useState(readNotifyPreference)
  const update = useCallback((next: boolean) => {
    window.localStorage.setItem(storageKey, next ? 'on' : 'off')
    setNotify(next)
  }, [])
  return [notify, update]
}
