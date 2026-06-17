export type LevelPoint = {
  x: number
  y: number
}

export type LevelTileCell = {
  x: number
  y: number
  spriteX: number
  spriteY: number
  flipX: boolean
  flipY: boolean
  tilesetRelPath: string
}

export type LevelTileLayer = {
  identifier: string
  tileSize: number
  columns: number
  rows: number
  opacity: number
  cells: LevelTileCell[]
}

export type GameLevel = {
  identifier: string
  tileSize: number
  columns: number
  rows: number
  width: number
  height: number
  backgroundLayer: LevelTileLayer
  solidLayer: LevelTileLayer
  decorLayer: LevelTileLayer
  spawnPoint: LevelPoint
}

export type LdtkProject = {
  externalLevels?: boolean
  defs?: {
    tilesets?: LdtkTilesetDefinition[]
  }
  levels?: LdtkProjectLevel[]
}

export type LdtkProjectLevel = {
  identifier: string
  uid: number
  externalRelPath?: string | null
  layerInstances?: LdtkLayerInstance[] | null
}

export type LdtkLevel = LdtkProjectLevel & {
  iid: string
  pxWid: number
  pxHei: number
  layerInstances: LdtkLayerInstance[]
}

export type LdtkLayerInstance = {
  __identifier: string
  __type: string
  __gridSize?: number
  __cWid: number
  __cHei: number
  __opacity?: number
  __pxTotalOffsetX?: number
  __pxTotalOffsetY?: number
  __tilesetDefUid?: number | null
  __tilesetRelPath?: string | null
  gridTiles?: LdtkGridTile[]
  entityInstances?: LdtkEntityInstance[]
}

export type LdtkGridTile = {
  px: [number, number]
  src: [number, number]
  f: number
}

export type LdtkEntityInstance = {
  __identifier: string
  px: [number, number]
}

export type LdtkTilesetDefinition = {
  uid: number
  relPath: string
  tileGridSize: number
}

export const LDTK_BACKGROUND_LAYER = 'Bg'
export const LDTK_SOLID_LAYER = 'Fg'
export const LDTK_DECOR_LAYER = 'Decor'
export const LDTK_PLAYER_SPAWN_ENTITY = 'PlayerSpawn'

export function loadLdtkLevels(
  projectJson: string,
  externalLevelJsonByPath: Record<string, string>,
): GameLevel[] {
  const project = parseLdtkProject(projectJson)
  const tilesets = new Map(
    (project.defs?.tilesets ?? []).map(tileset => [tileset.uid, tileset]),
  )
  const externalLevels = normalizeExternalLevelSources(externalLevelJsonByPath)
  const projectLevels = project.levels ?? []

  if (projectLevels.length === 0) {
    throw new Error('LDtk project must contain at least one level.')
  }

  return projectLevels.map(projectLevel =>
    createGameLevel(loadProjectLevel(projectLevel, externalLevels), tilesets),
  )
}

export function parseLdtkProject(projectJson: string): LdtkProject {
  const parsed: unknown = JSON.parse(projectJson)

  if (!isRecord(parsed)) {
    throw new Error('LDtk project JSON must be an object.')
  }

  return parsed as LdtkProject
}

export function normalizeExternalLevelSources(
  externalLevelJsonByPath: Record<string, string>,
) {
  const normalized = new Map<string, string>()

  for (const [path, source] of Object.entries(externalLevelJsonByPath)) {
    normalized.set(normalizeLdtkPath(path), source)
  }

  return normalized
}

export function normalizeLdtkPath(path: string) {
  return path
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .replace(/^\.\.\//, '')
    .replace(/^\.\//, '')
    .replace(/\?.*$/, '')
}

export function loadProjectLevel(
  projectLevel: LdtkProjectLevel,
  externalLevels: Map<string, string>,
): LdtkLevel {
  if (projectLevel.externalRelPath) {
    const normalizedPath = normalizeLdtkPath(projectLevel.externalRelPath)
    const externalLevelJson = externalLevels.get(normalizedPath)

    if (!externalLevelJson) {
      throw new Error(`Missing external LDtk level file "${normalizedPath}".`)
    }

    const externalLevel = parseLdtkLevel(externalLevelJson)

    if (externalLevel.identifier !== projectLevel.identifier) {
      throw new Error(
        `External LDtk level "${normalizedPath}" identifier "${externalLevel.identifier}" does not match project level "${projectLevel.identifier}".`,
      )
    }

    return externalLevel
  }

  if (!Array.isArray(projectLevel.layerInstances)) {
    throw new Error(
      `LDtk level "${projectLevel.identifier}" has no embedded layerInstances or externalRelPath.`,
    )
  }

  return projectLevel as LdtkLevel
}

export function parseLdtkLevel(levelJson: string): LdtkLevel {
  const parsed: unknown = JSON.parse(levelJson)

  if (!isRecord(parsed)) {
    throw new Error('External LDtk level JSON must be an object.')
  }

  const level = parsed as LdtkLevel

  if (!Array.isArray(level.layerInstances)) {
    throw new Error(`External LDtk level "${level.identifier}" has no layers.`)
  }

  return level
}

export function createGameLevel(
  level: LdtkLevel,
  tilesets: Map<number, LdtkTilesetDefinition>,
): GameLevel {
  const solidLayer = findLdtkLayer(level, LDTK_SOLID_LAYER)
  const tileSize = getLayerGridSize(solidLayer)

  return {
    identifier: level.identifier,
    tileSize,
    columns: solidLayer.__cWid,
    rows: solidLayer.__cHei,
    width: level.pxWid,
    height: level.pxHei,
    backgroundLayer: tileLayerToLevelLayer(
      findLdtkLayer(level, LDTK_BACKGROUND_LAYER),
      tilesets,
    ),
    solidLayer: tileLayerToLevelLayer(solidLayer, tilesets),
    decorLayer: tileLayerToLevelLayer(
      findLdtkLayer(level, LDTK_DECOR_LAYER),
      tilesets,
    ),
    spawnPoint: findLdtkEntity(level.layerInstances, LDTK_PLAYER_SPAWN_ENTITY),
  }
}

export function findLdtkLayer(
  level: LdtkLevel,
  identifier: string,
): LdtkLayerInstance {
  const layer = level.layerInstances.find(
    candidate => candidate.__identifier === identifier,
  )

  if (!layer) {
    throw new Error(
      `Missing LDtk layer "${identifier}" in level "${level.identifier}".`,
    )
  }

  return layer
}

export function getLayerGridSize(layer: LdtkLayerInstance): number {
  const gridSize = layer.__gridSize

  if (gridSize === undefined) {
    throw new Error(`LDtk layer "${layer.__identifier}" is missing grid size.`)
  }

  return gridSize
}

export function tileLayerToLevelLayer(
  layer: LdtkLayerInstance,
  tilesets: Map<number, LdtkTilesetDefinition>,
): LevelTileLayer {
  if (layer.__type !== 'Tiles') {
    throw new Error(`LDtk layer "${layer.__identifier}" must be a Tiles layer.`)
  }

  if (!Array.isArray(layer.gridTiles)) {
    throw new Error(`LDtk layer "${layer.__identifier}" has no gridTiles.`)
  }

  const tileset = getLayerTileset(layer, tilesets)
  const tileSize = getLayerGridSize(layer)
  const offsetX = layer.__pxTotalOffsetX ?? 0
  const offsetY = layer.__pxTotalOffsetY ?? 0

  return {
    identifier: layer.__identifier,
    tileSize,
    columns: layer.__cWid,
    rows: layer.__cHei,
    opacity: layer.__opacity ?? 1,
    cells: layer.gridTiles.map(tile =>
      gridTileToCell(tile, tileset, offsetX, offsetY),
    ),
  }
}

export function getLayerTileset(
  layer: LdtkLayerInstance,
  tilesets: Map<number, LdtkTilesetDefinition>,
): LdtkTilesetDefinition {
  const tilesetUid = layer.__tilesetDefUid

  if (tilesetUid === undefined || tilesetUid === null) {
    throw new Error(`LDtk layer "${layer.__identifier}" has no tileset.`)
  }

  const tileset = tilesets.get(tilesetUid)

  if (!tileset) {
    throw new Error(
      `LDtk layer "${layer.__identifier}" references missing tileset ${tilesetUid}.`,
    )
  }

  return tileset
}

export function gridTileToCell(
  tile: LdtkGridTile,
  tileset: LdtkTilesetDefinition,
  offsetX: number,
  offsetY: number,
): LevelTileCell {
  const spriteX = tile.src[0] / tileset.tileGridSize
  const spriteY = tile.src[1] / tileset.tileGridSize

  if (!Number.isInteger(spriteX) || !Number.isInteger(spriteY)) {
    throw new Error(
      `LDtk tile source ${tile.src.join(',')} does not align to tileset "${tileset.relPath}" grid ${tileset.tileGridSize}.`,
    )
  }

  return {
    x: tile.px[0] + offsetX,
    y: tile.px[1] + offsetY,
    spriteX,
    spriteY,
    flipX: (tile.f & 1) !== 0,
    flipY: (tile.f & 2) !== 0,
    tilesetRelPath: tileset.relPath,
  }
}

export function findLdtkEntity(
  layers: LdtkLayerInstance[],
  identifier: string,
): LevelPoint {
  for (const layer of layers) {
    for (const entity of layer.entityInstances ?? []) {
      if (entity.__identifier === identifier) {
        return { x: entity.px[0], y: entity.px[1] }
      }
    }
  }

  throw new Error(`Missing LDtk entity "${identifier}".`)
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
