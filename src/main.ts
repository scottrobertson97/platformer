import kaplay, { type GameObj } from 'kaplay'
import './style.css'
import tilesheetUrl from '../platformerPack_industrial_tilesheet.png?url'
import completeSpritesheetUrl from '../spritesheet_complete.png?url'
import { makeCompleteSpritesheetAtlas, makeTilesheetAtlas } from './atlas'
import {
  followPlayerCamera,
  getCameraState,
  snapCameraToPlayer,
} from './camera'
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
import { createPauseMenu } from './pauseMenu'
import { registerTestHooks } from './testHooks'
import { TITLE_SCENE, createTitleScreen } from './titleScreen'
import { addWorld } from './world'

const root = document.querySelector<HTMLElement>('#game')

if (!root) {
  throw new Error('Missing #game root element')
}

const hasInitialLevelQuery = new URLSearchParams(window.location.search).has(
  'level',
)
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

let selectedLevel = initialLevel
let activeLevel = initialLevel
let player: GameObj | null = null
const titleScreen = createTitleScreen({
  root,
  levels: LEVELS,
  selectedLevelIdentifier: initialLevel.identifier,
  onSelectLevel: startLevel,
})
const pauseMenu = createPauseMenu({
  root,
  onResume: resumeGame,
  onLevelSelect: exitToLevelSelect,
})

registerTitleScene()
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
  getCameraState: () => getCameraState(k),
  getMenuState: titleScreen.getState,
  getPauseState: pauseMenu.getState,
})

k.go(hasInitialLevelQuery ? initialLevel.identifier : TITLE_SCENE)

function registerTitleScene() {
  k.scene(TITLE_SCENE, () => {
    activeLevel = selectedLevel
    player = null
    pauseMenu.hide()
    k.debug.paused = false

    k.setBackground(k.rgb(...BACKGROUND_COLOR))
    k.setCamPos(selectedLevel.width / 2, selectedLevel.height / 2)
    addWorld(k, selectedLevel)
    titleScreen.show(selectedLevel.identifier)
  })
}

function registerLevelScene(level: GameLevel) {
  k.scene(level.identifier, () => {
    activeLevel = level
    selectedLevel = level
    titleScreen.hide()
    pauseMenu.hide()
    k.debug.paused = false
    focusGameCanvas()
    const spawnPoint = getSpawnPoint(k, level.spawnPoint)

    k.setBackground(k.rgb(...BACKGROUND_COLOR))
    addWorld(k, level)

    player = createPlayer(k, spawnPoint)
    snapCameraToPlayer(k, player, level.width, level.height)

    const resetCurrentPlayer = () => {
      resetPlayer(k, player, spawnPoint)

      if (player) {
        snapCameraToPlayer(k, player, level.width, level.height)
      }
    }

    k.onKeyPress(['space', 'w', 'up'], () => {
      if (pauseMenu.getState().visible) {
        return
      }

      if (player?.isGrounded()) {
        player.jump()
      }
    })

    k.onKeyPress('r', () => {
      if (pauseMenu.getState().visible) {
        return
      }

      resetCurrentPlayer()
    })

    k.onKeyPress('f', () => {
      if (pauseMenu.getState().visible) {
        return
      }

      k.setFullscreen(!k.isFullscreen())
    })

    k.onKeyPress('escape', () => {
      togglePause(level.identifier)
    })

    k.onUpdate(() => {
      if (!player || pauseMenu.getState().visible) {
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

function startLevel(identifier: string) {
  selectedLevel = getLevelByIdentifier(identifier)
  activeLevel = selectedLevel
  titleScreen.hide()
  pauseMenu.hide()
  k.debug.paused = false
  setLevelQuery(identifier)
  k.go(identifier)
  focusGameCanvas()
}

function togglePause(levelIdentifier: string) {
  if (pauseMenu.getState().visible) {
    resumeGame()
    return
  }

  pauseGame(levelIdentifier)
}

function pauseGame(levelIdentifier: string) {
  pauseMenu.show(levelIdentifier)
  k.debug.paused = true
}

function resumeGame() {
  pauseMenu.hide()
  k.debug.paused = false
  focusGameCanvas()
}

function exitToLevelSelect() {
  pauseMenu.hide()
  k.debug.paused = false
  clearLevelQuery()
  k.go(TITLE_SCENE)
}

function getInitialLevelIdentifier() {
  return (
    new URLSearchParams(window.location.search).get('level') ??
    START_LEVEL_IDENTIFIER
  )
}

function setLevelQuery(identifier: string) {
  const url = new URL(window.location.href)
  url.searchParams.set('level', identifier)
  window.history.replaceState(
    null,
    '',
    `${url.pathname}${url.search}${url.hash}`,
  )
}

function clearLevelQuery() {
  const url = new URL(window.location.href)
  url.searchParams.delete('level')
  window.history.replaceState(
    null,
    '',
    `${url.pathname}${url.search}${url.hash}`,
  )
}

function focusGameCanvas() {
  k.canvas.focus()
}
