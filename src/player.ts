import type { GameObj, KAPLAYCtx } from 'kaplay'
import {
  PLAYER_HEIGHT,
  PLAYER_IDLE_FRAME,
  PLAYER_JUMP_FORCE,
  PLAYER_SPRITE_SCALE,
  PLAYER_SPEED,
  PLAYER_WALK_FRAME_SECONDS,
  PLAYER_WALK_FRAMES,
  PLAYER_WIDTH,
} from './config'
import { TILE_SIZE, type TilePoint } from './level'

export type PlayerState = {
  x: number
  y: number
  vx: number
  vy: number
  grounded: boolean
}

export type SpawnPoint = ReturnType<KAPLAYCtx['vec2']>
export type PlayerSpriteFrame = {
  top: string
  bottom: string
}
export type PlayerVisualPart = GameObj & {
  sprite: string
}
export type PlayerVisualState = {
  top: PlayerVisualPart
  bottom: PlayerVisualPart
  elapsed: number
  frameIndex: number
  isWalking: boolean
}
export type PlayerObject = GameObj & {
  visualState?: PlayerVisualState
}

export function getSpawnPoint(k: KAPLAYCtx, spawnTile: TilePoint): SpawnPoint {
  return k.vec2(
    spawnTile.x * TILE_SIZE + (TILE_SIZE - PLAYER_WIDTH) / 2,
    spawnTile.y * TILE_SIZE + TILE_SIZE - PLAYER_HEIGHT,
  )
}

export function createPlayer(k: KAPLAYCtx, spawnPoint: SpawnPoint): GameObj {
  const player = k.add([
    k.pos(spawnPoint),
    k.rect(PLAYER_WIDTH, PLAYER_HEIGHT, { fill: false }),
    k.area(),
    k.body({ jumpForce: PLAYER_JUMP_FORCE }),
    'player',
  ]) as PlayerObject

  player.visualState = {
    top: addPlayerSpritePart(k, player, PLAYER_IDLE_FRAME.top, 0),
    bottom: addPlayerSpritePart(k, player, PLAYER_IDLE_FRAME.bottom, TILE_SIZE),
    elapsed: 0,
    frameIndex: 0,
    isWalking: false,
  }

  return player
}

export function addPlayerSpritePart(
  k: KAPLAYCtx,
  player: GameObj,
  spriteName: string,
  y: number,
) {
  return player.add([
    k.pos(0, y),
    k.sprite(spriteName),
    k.scale(PLAYER_SPRITE_SCALE),
    k.z(20),
  ]) as PlayerVisualPart
}

export function resetPlayer(
  k: KAPLAYCtx,
  player: GameObj | null,
  spawnPoint: SpawnPoint,
) {
  if (!player) {
    return
  }

  player.pos = spawnPoint.clone()
  player.vel = k.vec2(0, 0)
}

export function updatePlayerMovement(
  k: KAPLAYCtx,
  player: GameObj,
  worldWidth: number,
) {
  const horizontal =
    Number(k.isKeyDown(['d', 'right'])) - Number(k.isKeyDown(['a', 'left']))

  player.move(horizontal * PLAYER_SPEED, 0)
  player.pos.x = k.clamp(player.pos.x, 0, worldWidth - PLAYER_WIDTH)
  updatePlayerAnimation(k, player as PlayerObject, horizontal !== 0)
}

export function updatePlayerAnimation(
  k: KAPLAYCtx,
  player: PlayerObject,
  isWalking: boolean,
) {
  const visualState = player.visualState

  if (!visualState) {
    return
  }

  if (!isWalking) {
    visualState.elapsed = 0
    visualState.frameIndex = 0
    visualState.isWalking = false
    setPlayerVisualFrame(k, visualState, PLAYER_IDLE_FRAME)
    return
  }

  if (!visualState.isWalking) {
    visualState.elapsed = 0
    visualState.frameIndex = 0
    visualState.isWalking = true
    setPlayerVisualFrame(k, visualState, PLAYER_WALK_FRAMES[0])
    return
  }

  visualState.elapsed += k.dt()

  if (visualState.elapsed < PLAYER_WALK_FRAME_SECONDS) {
    return
  }

  visualState.elapsed -= PLAYER_WALK_FRAME_SECONDS
  visualState.frameIndex = (visualState.frameIndex + 1) % PLAYER_WALK_FRAMES.length
  setPlayerVisualFrame(k, visualState, PLAYER_WALK_FRAMES[visualState.frameIndex])
}

export function setPlayerVisualFrame(
  k: KAPLAYCtx,
  visualState: PlayerVisualState,
  frame: PlayerSpriteFrame,
) {
  if (visualState.top.sprite !== frame.top) {
    visualState.top.use(k.sprite(frame.top))
  }

  if (visualState.bottom.sprite !== frame.bottom) {
    visualState.bottom.use(k.sprite(frame.bottom))
  }
}

export function getPlayerState(player: GameObj): PlayerState {
  return {
    x: round(player.pos.x),
    y: round(player.pos.y),
    vx: round(player.vel?.x ?? 0),
    vy: round(player.vel?.y ?? 0),
    grounded: Boolean(player.isGrounded?.()),
  }
}

export function round(value: number) {
  return Math.round(value * 100) / 100
}
