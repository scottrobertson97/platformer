import type { SpriteAtlasData } from 'kaplay'
import {
  ATLAS_COLUMNS,
  ATLAS_ROWS,
  ATLAS_SPRITE_PREFIX,
  COMPLETE_ATLAS_COLUMNS,
  COMPLETE_ATLAS_ROWS,
  COMPLETE_ATLAS_SPRITE_PREFIX,
  COMPLETE_ATLAS_TILE_SIZE,
} from './config'
import { TILE_SIZE } from './level'
import { spriteKey } from './spriteKeys'

export function makeTilesheetAtlas(): SpriteAtlasData {
  return makeGridAtlas({
    columns: ATLAS_COLUMNS,
    rows: ATLAS_ROWS,
    tileSize: TILE_SIZE,
    spritePrefix: ATLAS_SPRITE_PREFIX,
  })
}

export function makeCompleteSpritesheetAtlas(): SpriteAtlasData {
  return makeGridAtlas({
    columns: COMPLETE_ATLAS_COLUMNS,
    rows: COMPLETE_ATLAS_ROWS,
    tileSize: COMPLETE_ATLAS_TILE_SIZE,
    spritePrefix: COMPLETE_ATLAS_SPRITE_PREFIX,
    // KAPLAY 3001 normalizes rectangular atlas X values against source height.
    xCoordinateScale: COMPLETE_ATLAS_ROWS / COMPLETE_ATLAS_COLUMNS,
  })
}

export type GridAtlasOptions = {
  columns: number
  rows: number
  tileSize: number
  spritePrefix: string
  xCoordinateScale?: number
}

export function makeGridAtlas({
  columns,
  rows,
  tileSize,
  spritePrefix,
  xCoordinateScale = 1,
}: GridAtlasOptions): SpriteAtlasData {
  const atlas: SpriteAtlasData = {}

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      atlas[spriteKey(spritePrefix, column, row)] = {
        x: column * tileSize * xCoordinateScale,
        y: row * tileSize,
        width: tileSize * xCoordinateScale,
        height: tileSize,
      }
    }
  }

  return atlas
}
