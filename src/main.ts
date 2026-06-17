import kaplay, { type GameObj } from 'kaplay'
import './style.css'
import tilesheetUrl from '../platformerPack_industrial_tilesheet.png?url'
import completeSpritesheetUrl from '../spritesheet_complete.png?url'
import { makeCompleteSpritesheetAtlas, makeTilesheetAtlas } from './atlas'
import { followPlayerCamera } from './camera'
import {
  BACKGROUND_COLOR,
  GRAVITY,
  VIEW_HEIGHT,
  VIEW_WIDTH,
} from './config'
import {
  LEVELS,
  START_LEVEL_IDENTIFIER,
  getLevelByIdentifier,
  type GameLevel,
} from './level'
import {
  createPlayer,
  getPlayerState,
  getSpawnPoint,
  resetPlayer,
  updatePlayerMovement,
} from './player'
import { registerTestHooks } from './testHooks'
import { addWorld } from './world'

const root = document.querySelector<HTMLElement>('#game')

if (!root) {
  throw new Error('Missing #game root element')
}

const initialLevel = getLevelByIdentifier(getInitialLevelIdentifier())

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
k.loadSpriteAtlas(completeSpritesheetUrl, makeCompleteSpritesheetAtlas())
k.setGravity(GRAVITY)

let activeLevel = initialLevel
let player: GameObj | null = null

for (const level of LEVELS) {
  registerLevelScene(level)
}

registerTestHooks({
  k,
  getMapState: () => ({
    levelIdentifier: activeLevel.identifier,
    tileSize: activeLevel.tileSize,
    columns: activeLevel.columns,
    rows: activeLevel.rows,
    width: activeLevel.width,
    height: activeLevel.height,
  }),
  getPlayerState: () => (player ? getPlayerState(player) : null),
})

k.go(initialLevel.identifier)

function registerLevelScene(level: GameLevel) {
  k.scene(level.identifier, () => {
    activeLevel = level
    const spawnPoint = getSpawnPoint(k, level.spawnPoint)

    k.setBackground(k.rgb(...BACKGROUND_COLOR))
    addWorld(k, level)

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

      updatePlayerMovement(k, player, level.width)

      if (player.pos.y > level.height + level.tileSize) {
        resetCurrentPlayer()
      }

      followPlayerCamera(k, player, level.width, level.height)
    })
  })
}

function getInitialLevelIdentifier() {
  return (
    new URLSearchParams(window.location.search).get('level') ??
    START_LEVEL_IDENTIFIER
  )
}
