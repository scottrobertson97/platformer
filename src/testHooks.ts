import type { KAPLAYCtx } from 'kaplay'
import type { PlayerState } from './player'

export type MapState = {
  levelIdentifier: string
  tileSize: number
  columns: number
  rows: number
  width: number
  height: number
}

export type TestHookOptions = {
  k: KAPLAYCtx
  getMapState: () => MapState
  getPlayerState: () => PlayerState | null
}

export function registerTestHooks({
  k,
  getMapState,
  getPlayerState,
}: TestHookOptions) {
  window.render_game_to_text = () =>
    JSON.stringify({
      coordinateSystem: 'world pixels, origin top-left, x right, y down',
      scene: k.getSceneName(),
      map: getMapState(),
      player: getPlayerState(),
      controls: {
        move: ['a', 'd', 'left', 'right'],
        jump: ['w', 'up', 'space'],
        restart: 'r',
        fullscreen: 'f',
      },
    })

  window.advanceTime = (ms: number) => {
    const frameCount = Math.max(1, Math.round(ms / (1000 / 60)))

    for (let i = 0; i < frameCount; i += 1) {
      k.debug.stepFrame()
    }
  }
}
