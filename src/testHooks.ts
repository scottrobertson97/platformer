import type { KAPLAYCtx } from 'kaplay'
import type { PlayerState } from './player'
import type { TitleScreenState } from './titleScreen'

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
  getMenuState: () => TitleScreenState
}

export function registerTestHooks({
  k,
  getMapState,
  getPlayerState,
  getMenuState,
}: TestHookOptions) {
  window.render_game_to_text = () =>
    JSON.stringify({
      coordinateSystem: 'world pixels, origin top-left, x right, y down',
      scene: k.getSceneName(),
      map: getMapState(),
      player: getPlayerState(),
      menu: getMenuState(),
      controls: {
        move: ['a', 'd', 'left', 'right'],
        jump: ['w', 'up', 'space'],
        restart: 'r',
        fullscreen: 'f',
        menu: {
          select: ['up', 'down', 'left', 'right'],
          start: 'enter',
          title: 'escape',
        },
      },
    })

  window.advanceTime = (ms: number) => {
    const frameCount = Math.max(1, Math.round(ms / (1000 / 60)))

    for (let i = 0; i < frameCount; i += 1) {
      k.debug.stepFrame()
    }
  }
}
