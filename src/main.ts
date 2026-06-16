import kaplay, { type GameObj } from 'kaplay'
import './style.css'
import tilesheetUrl from '../platformerPack_industrial_tilesheet.png?url'
import { makeTilesheetAtlas } from './atlas'
import { followPlayerCamera } from './camera'
import {
  BACKGROUND_COLOR,
  GRAVITY,
  VIEW_HEIGHT,
  VIEW_WIDTH,
} from './config'
import {
  LEVEL_HEIGHT,
  LEVEL_WIDTH,
  SOLID_MAP,
  TILE_SIZE,
  findTile,
  stripTile,
} from './level'
import {
  createPlayer,
  getPlayerState,
  getSpawnPoint,
  resetPlayer,
  updatePlayerMovement,
} from './player'
import { registerTestHooks } from './testHooks'
import { createFactoryTileManager } from './tiles'
import { addWorld } from './world'

const spawnTile = findTile(SOLID_MAP, '@')
const solidMap = stripTile(SOLID_MAP, '@')
const tileManager = createFactoryTileManager()
const worldWidth = LEVEL_WIDTH * TILE_SIZE
const worldHeight = LEVEL_HEIGHT * TILE_SIZE

const root = document.querySelector<HTMLElement>('#game')

if (!root) {
  throw new Error('Missing #game root element')
}

const k = kaplay({
  root,
  width: VIEW_WIDTH,
  height: VIEW_HEIGHT,
  letterbox: true,
  crisp: true,
  global: false,
  background: BACKGROUND_COLOR,
})

k.loadSpriteAtlas(tilesheetUrl, makeTilesheetAtlas())
k.setGravity(GRAVITY)

let player: GameObj | null = null

k.scene('factory', () => {
  const spawnPoint = getSpawnPoint(k, spawnTile)

  k.setBackground(k.rgb(...BACKGROUND_COLOR))
  addWorld(k, solidMap, tileManager)

  player = createPlayer(k, spawnPoint)

  const resetCurrentPlayer = () => resetPlayer(k, player, spawnPoint)

  k.onKeyPress(['space', 'w', 'up'], () => {
    if (player?.isGrounded()) {
      player.jump()
    }
  })

  k.onKeyPress('r', resetCurrentPlayer)

  k.onKeyPress('f', () => {
    k.setFullscreen(!k.isFullscreen())
  })

  k.onUpdate(() => {
    if (!player) {
      return
    }

    updatePlayerMovement(k, player, worldWidth)

    if (player.pos.y > worldHeight + TILE_SIZE) {
      resetCurrentPlayer()
    }

    followPlayerCamera(k, player, worldWidth, worldHeight)
  })
})

registerTestHooks({
  k,
  getMapState: () => ({
    tileSize: TILE_SIZE,
    columns: LEVEL_WIDTH,
    rows: LEVEL_HEIGHT,
    width: worldWidth,
    height: worldHeight,
  }),
  getPlayerState: () => (player ? getPlayerState(player) : null),
})

k.go('factory')
