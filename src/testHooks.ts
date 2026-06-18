import type { KAPLAYCtx } from 'kaplay'
import type { CameraState } from './camera'
import type { PauseMenuState } from './pauseMenu'
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
  getCameraState: () => CameraState
  getMenuState: () => TitleScreenState
  getPauseState: () => PauseMenuState
}

export function registerTestHooks({
  k,
  getMapState,
  getPlayerState,
  getCameraState,
  getMenuState,
  getPauseState,
}: TestHookOptions) {
  window.render_game_to_text = () =>
    JSON.stringify({
      coordinateSystem: 'world pixels, origin top-left, x right, y down',
      scene: k.getSceneName(),
      map: getMapState(),
      player: getPlayerState(),
      camera: getCameraState(),
      menu: getMenuState(),
      pause: getPauseState(),
      controls: {
        move: ['a', 'd', 'left', 'right'],
        jump: ['w', 'up', 'space'],
        restart: 'r',
        fullscreen: 'f',
        menu: {
          select: ['up', 'down', 'left', 'right'],
          start: 'enter',
          pause: 'escape',
        },
      },
    })

  window.advanceTime = (ms: number) => {
    if (getPauseState().visible) {
      return
    }

    const frameCount = Math.max(1, Math.round(ms / (1000 / 60)))

    for (let i = 0; i < frameCount; i += 1) {
      k.debug.stepFrame()
    }
  }
}
