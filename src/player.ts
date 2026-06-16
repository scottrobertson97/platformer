import type { GameObj, KAPLAYCtx } from 'kaplay'
import {
  PLAYER_COLOR,
  PLAYER_HEIGHT,
  PLAYER_JUMP_FORCE,
  PLAYER_OUTLINE_COLOR,
  PLAYER_SPEED,
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

export function getSpawnPoint(k: KAPLAYCtx, spawnTile: TilePoint): SpawnPoint {
  return k.vec2(
    spawnTile.x * TILE_SIZE + (TILE_SIZE - PLAYER_WIDTH) / 2,
    spawnTile.y * TILE_SIZE + TILE_SIZE - PLAYER_HEIGHT,
  )
}

export function createPlayer(k: KAPLAYCtx, spawnPoint: SpawnPoint): GameObj {
  return k.add([
    k.pos(spawnPoint),
    k.rect(PLAYER_WIDTH, PLAYER_HEIGHT, { radius: 4 }),
    k.color(...PLAYER_COLOR),
    k.outline(3, k.rgb(...PLAYER_OUTLINE_COLOR)),
    k.area(),
    k.body({ jumpForce: PLAYER_JUMP_FORCE }),
    'player',
  ])
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
