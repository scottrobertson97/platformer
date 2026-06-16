import type { SpriteAtlasData } from 'kaplay'
import { ATLAS_COLUMNS, ATLAS_ROWS } from './config'
import { TILE_SIZE } from './level'

export function makeTilesheetAtlas(): SpriteAtlasData {
  const atlas: SpriteAtlasData = {}

  for (let row = 0; row < ATLAS_ROWS; row += 1) {
    for (let column = 0; column < ATLAS_COLUMNS; column += 1) {
      const id = row * ATLAS_COLUMNS + column

      atlas[`tile-${id}`] = {
        x: column * TILE_SIZE,
        y: row * TILE_SIZE,
        width: TILE_SIZE,
        height: TILE_SIZE,
      }
    }
  }

  return atlas
}
