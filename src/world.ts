import type { CompList, GameObj, KAPLAYCtx } from 'kaplay'
import type { GameLevel, LevelTileCell, LevelTileLayer } from './ldtk'
import { factoryTile } from './spriteKeys'

export const INDUSTRIAL_TILESET_REL_PATH =
  'platformerPack_industrial_tilesheet.png'

export type TileSpriteObject = GameObj & {
  flipX: boolean
  flipY: boolean
}

export function addBackground(k: KAPLAYCtx, level: GameLevel) {
  addTileLayer(k, level.backgroundLayer, {
    z: -20,
    solid: false,
  })
}

export function addSolids(k: KAPLAYCtx, level: GameLevel) {
  addTileLayer(k, level.solidLayer, {
    z: 0,
    solid: true,
    tags: ['solid'],
  })
}

export function addDecor(k: KAPLAYCtx, level: GameLevel) {
  addTileLayer(k, level.decorLayer, {
    z: 10,
    solid: false,
  })
}

export function addWorld(k: KAPLAYCtx, level: GameLevel) {
  addBackground(k, level)
  addSolids(k, level)
  addDecor(k, level)
}

export type AddTileLayerOptions = {
  z: number
  solid: boolean
  tags?: string[]
}

export function addTileLayer(
  k: KAPLAYCtx,
  layer: LevelTileLayer,
  options: AddTileLayerOptions,
) {
  for (const cell of layer.cells) {
    addTileCell(k, cell, layer.opacity, options)
  }
}

export function addTileCell(
  k: KAPLAYCtx,
  cell: LevelTileCell,
  opacity: number,
  { z, solid, tags = [] }: AddTileLayerOptions,
) {
  assertSupportedTileset(cell)

  const components: CompList<unknown> = [
    k.pos(cell.x, cell.y),
    k.sprite(factoryTile(cell.spriteX, cell.spriteY)),
    k.z(z),
    ...tags,
  ]

  if (opacity !== 1) {
    components.push(k.opacity(opacity))
  }

  if (solid) {
    components.push(k.area(), k.body({ isStatic: true }))
  }

  const tile = k.add(components) as TileSpriteObject
  tile.flipX = cell.flipX
  tile.flipY = cell.flipY
  return tile
}

export function assertSupportedTileset(cell: LevelTileCell) {
  if (cell.tilesetRelPath !== INDUSTRIAL_TILESET_REL_PATH) {
    throw new Error(
      `Unsupported LDtk tileset "${cell.tilesetRelPath}". Only "${INDUSTRIAL_TILESET_REL_PATH}" is currently registered for level tiles.`,
    )
  }
}
