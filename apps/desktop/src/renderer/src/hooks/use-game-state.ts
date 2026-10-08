import { useEffect, useState } from 'react'

export type GameStatus = Awaited<ReturnType<typeof window.nms.getGameStatus>>
export type BuildSupport = Awaited<ReturnType<typeof window.nms.getBuildSupport>>
export type CatalogStatus = Awaited<ReturnType<typeof window.nms.getCatalogStatus>>
export type DiagnosticsStatus = Awaited<ReturnType<typeof window.nms.getRuntimeDiagnosticsStatus>>

export type GameState = {
  game: GameStatus | null
  build: BuildSupport | null
  catalog: CatalogStatus | null
  diagnostics: DiagnosticsStatus | null
}

// Read-only state of the installation, the game process and the bridge, refreshed while mounted.
export function useGameState(): GameState {
  const [state, setState] = useState<GameState>({
    game: null,
    build: null,
    catalog: null,
    diagnostics: null
  })

  useEffect(() => {
    let active = true
    const refresh = (): void => {
      void Promise.all([
        window.nms.getGameStatus().catch(() => null),
        window.nms.getBuildSupport().catch(() => null),
        window.nms.getCatalogStatus().catch(() => null),
        window.nms.getRuntimeDiagnosticsStatus().catch(() => null)
      ]).then(([game, build, catalog, diagnostics]) => {
        if (active) setState({ game, build, catalog, diagnostics })
      })
    }
    refresh()
    const timer = window.setInterval(refresh, 5000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [])

  return state
}
