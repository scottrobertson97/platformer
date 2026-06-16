import type { CompList, KAPLAYCtx } from 'kaplay'
import { BACKGROUND_MAP, DECOR_MAP, TILE_SIZE } from './level'

export function addBackground(k: KAPLAYCtx) {
  k.addLevel(BACKGROUND_MAP, {
    tileWidth: TILE_SIZE,
    tileHeight: TILE_SIZE,
    tiles: {
      '.': () => [k.sprite('tile-4'), k.opacity(0.36), k.z(-20)],
    },
  })
}

export function addSolids(k: KAPLAYCtx, solidMap: string[]) {
  k.addLevel(solidMap, {
    tileWidth: TILE_SIZE,
    tileHeight: TILE_SIZE,
    tiles: {
      '#': () => [
        k.sprite('tile-42'),
        k.area(),
        k.body({ isStatic: true }),
        k.z(0),
        'solid',
      ],
    },
  })
}

export function addDecor(k: KAPLAYCtx) {
  k.addLevel(DECOR_MAP, {
    tileWidth: TILE_SIZE,
    tileHeight: TILE_SIZE,
    tiles: {
      D: () => decorTile(k, 'tile-69', ['door', 'remembering-door']),
      P: () => decorTile(k, 'tile-74', ['password']),
      h: () => decorTile(k, 'tile-51', ['hazard-sign']),
      p: () => decorTile(k, 'tile-61', ['pipe']),
      r: () => decorTile(k, 'tile-83', ['route-marker']),
      s: () => decorTile(k, 'tile-37', ['spikes']),
      v: () => decorTile(k, 'tile-71', ['valve']),
    },
  })
}

export function addWorld(k: KAPLAYCtx, solidMap: string[]) {
  addBackground(k)
  addSolids(k, solidMap)
  addDecor(k)
}

export function decorTile(
  k: KAPLAYCtx,
  spriteName: string,
  tags: string[],
): CompList<unknown> {
  return [k.sprite(spriteName), k.z(10), ...tags]
}
