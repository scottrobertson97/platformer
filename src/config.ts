import { TILE_SIZE } from './level'

export const VIEW_WIDTH = 960
export const VIEW_HEIGHT = 540

export const GRAVITY = 1600

export const PLAYER_SPEED = 330
export const PLAYER_JUMP_FORCE = 760
export const PLAYER_WIDTH = TILE_SIZE
export const PLAYER_HEIGHT = TILE_SIZE * 2

export const ATLAS_COLUMNS = 14
export const ATLAS_ROWS = 8
export const ATLAS_SPRITE_PREFIX = 'tile'

export const COMPLETE_ATLAS_COLUMNS = 32
export const COMPLETE_ATLAS_ROWS = 16
export const COMPLETE_ATLAS_TILE_SIZE = 128
export const COMPLETE_ATLAS_SPRITE_PREFIX = 'spritesheet'

export const PLAYER_IDLE_FRAME = {
  top: 'spritesheet-68',
  bottom: 'spritesheet-100',
} as const
export const PLAYER_WALK_FRAMES = [
  {
    top: 'spritesheet-67',
    bottom: 'spritesheet-99',
  },
  {
    top: 'spritesheet-137',
    bottom: 'spritesheet-163',
  },
] as const
export const PLAYER_WALK_FRAME_SECONDS = 0.14
export const PLAYER_SPRITE_SCALE = TILE_SIZE / COMPLETE_ATLAS_TILE_SIZE

export const BACKGROUND_COLOR: [number, number, number] = [22, 26, 28]
