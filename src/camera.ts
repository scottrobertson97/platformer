import type { GameObj, KAPLAYCtx } from 'kaplay'
import {
  CAMERA_HORIZONTAL_SAFEZONE_RATIO,
  PLAYER_HEIGHT,
  PLAYER_WIDTH,
} from './config'

export type CameraState = {
  x: number
  y: number
  safezoneWidth: number
  safezoneLeft: number
  safezoneRight: number
}

export function followPlayerCamera(
  k: KAPLAYCtx,
  target: GameObj,
  worldWidth: number,
  worldHeight: number,
) {
  const desiredX = target.pos.x + PLAYER_WIDTH / 2
  const desiredY = target.pos.y + PLAYER_HEIGHT / 2
  const currentCamera = k.getCamPos()

  k.setCamPos(
    followCameraAxisWithSafezone(
      k,
      desiredX,
      currentCamera.x,
      k.width(),
      worldWidth,
    ),
    clampCameraAxis(k, desiredY, k.height(), worldHeight),
  )
}

export function snapCameraToPlayer(
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

export function followCameraAxisWithSafezone(
  k: KAPLAYCtx,
  target: number,
  currentCamera: number,
  viewportSize: number,
  worldSize: number,
) {
  const safezoneWidth = getHorizontalSafezoneWidth(viewportSize)
  const safezoneLeft = currentCamera - safezoneWidth / 2
  const safezoneRight = currentCamera + safezoneWidth / 2
  let nextCamera = currentCamera

  if (target < safezoneLeft) {
    nextCamera = target + safezoneWidth / 2
  } else if (target > safezoneRight) {
    nextCamera = target - safezoneWidth / 2
  }

  return clampCameraAxis(k, nextCamera, viewportSize, worldSize)
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

export function getCameraState(k: KAPLAYCtx): CameraState {
  const camera = k.getCamPos()
  const safezoneWidth = getHorizontalSafezoneWidth(k.width())
  const safezoneLeft = camera.x - safezoneWidth / 2
  const safezoneRight = camera.x + safezoneWidth / 2

  return {
    x: round(camera.x),
    y: round(camera.y),
    safezoneWidth: round(safezoneWidth),
    safezoneLeft: round(safezoneLeft),
    safezoneRight: round(safezoneRight),
  }
}

export function getHorizontalSafezoneWidth(viewportWidth: number) {
  return viewportWidth * CAMERA_HORIZONTAL_SAFEZONE_RATIO
}

function round(value: number) {
  return Math.round(value * 100) / 100
}
