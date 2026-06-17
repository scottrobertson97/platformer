export const FACTORY_TILE_PREFIX = 'tile'
export const COMPLETE_SPRITE_PREFIX = 'spritesheet'

export function factoryTile(x: number, y: number) {
  return spriteKey(FACTORY_TILE_PREFIX, x, y)
}

export function completeSprite(x: number, y: number) {
  return spriteKey(COMPLETE_SPRITE_PREFIX, x, y)
}

export function spriteKey(prefix: string, x: number, y: number) {
  assertSpriteCoordinate(x, 'x')
  assertSpriteCoordinate(y, 'y')
  return `${prefix}-${x}-${y}`
}

export function assertSpriteCoordinate(value: number, axis: 'x' | 'y') {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`Sprite ${axis} coordinate must be a non-negative integer.`)
  }
}
