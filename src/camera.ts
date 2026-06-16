import type { GameObj, KAPLAYCtx } from 'kaplay'
import { PLAYER_HEIGHT, PLAYER_WIDTH } from './config'

export function followPlayerCamera(
  k: KAPLAYCtx,
  target: GameObj,
  worldWidth: number,
  worldHeight: number,
) {
  const desiredX = target.pos.x + PLAYER_WIDTH / 2
  const desiredY = target.pos.y + PLAYER_HEIGHT / 2

  k.setCamPos(
    clampCameraAxis(k, desiredX, k.width(), worldWidth),
    clampCameraAxis(k, desiredY, k.height(), worldHeight),
  )
}

export function clampCameraAxis(
  k: KAPLAYCtx,
  target: number,
  viewportSize: number,
  worldSize: number,
) {
  if (worldSize <= viewportSize) {
    return worldSize / 2
  }

  return k.clamp(target, viewportSize / 2, worldSize - viewportSize / 2)
}
