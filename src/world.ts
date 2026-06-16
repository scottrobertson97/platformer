import type { KAPLAYCtx } from 'kaplay'
import { BACKGROUND_MAP, DECOR_MAP, TILE_SIZE } from './level'
import type { TileManager } from './tileManager'

export function addBackground(k: KAPLAYCtx, tileManager: TileManager) {
  k.addLevel(BACKGROUND_MAP, {
    tileWidth: TILE_SIZE,
    tileHeight: TILE_SIZE,
    tiles: tileManager.getLevelTiles(k, 'background'),
  })
}

export function addSolids(
  k: KAPLAYCtx,
  solidMap: string[],
  tileManager: TileManager,
) {
  k.addLevel(solidMap, {
    tileWidth: TILE_SIZE,
    tileHeight: TILE_SIZE,
    tiles: tileManager.getLevelTiles(k, 'solid'),
  })
}

export function addDecor(k: KAPLAYCtx, tileManager: TileManager) {
  k.addLevel(DECOR_MAP, {
    tileWidth: TILE_SIZE,
    tileHeight: TILE_SIZE,
    tiles: tileManager.getLevelTiles(k, 'decor'),
  })
}

export function addWorld(
  k: KAPLAYCtx,
  solidMap: string[],
  tileManager: TileManager,
) {
  addBackground(k, tileManager)
  addSolids(k, solidMap, tileManager)
  addDecor(k, tileManager)
}
