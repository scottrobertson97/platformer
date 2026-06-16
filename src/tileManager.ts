import type { CompList, KAPLAYCtx } from 'kaplay'

export type TileLayer = 'background' | 'solid' | 'decor'

export type TileDefinition = {
  id: string
  layer: TileLayer
  symbol: string
  sprite: string
  z: number
  opacity?: number
  tags?: string[]
  solid?: boolean
}

export type LevelTileFactories = NonNullable<
  Parameters<KAPLAYCtx['addLevel']>[1]['tiles']
>

export class TileManager {
  private readonly definitions = new Map<
    TileLayer,
    Map<string, TileDefinition>
  >()

  register(definition: TileDefinition) {
    if (definition.symbol.length !== 1) {
      throw new Error(
        `Tile "${definition.id}" must use exactly one map symbol.`,
      )
    }

    const layerDefinitions = this.getLayerDefinitions(definition.layer)

    if (layerDefinitions.has(definition.symbol)) {
      throw new Error(
        `Duplicate "${definition.symbol}" tile symbol in ${definition.layer} layer.`,
      )
    }

    layerDefinitions.set(definition.symbol, definition)
    return this
  }

  getLevelTiles(k: KAPLAYCtx, layer: TileLayer): LevelTileFactories {
    const tiles: LevelTileFactories = {}

    for (const definition of this.getLayerDefinitions(layer).values()) {
      tiles[definition.symbol] = () => createTileComponents(k, definition)
    }

    return tiles
  }

  private getLayerDefinitions(layer: TileLayer) {
    const existing = this.definitions.get(layer)

    if (existing) {
      return existing
    }

    const created = new Map<string, TileDefinition>()
    this.definitions.set(layer, created)
    return created
  }
}

export function createTileComponents(
  k: KAPLAYCtx,
  definition: TileDefinition,
): CompList<unknown> {
  const components: CompList<unknown> = [k.sprite(definition.sprite)]

  if (definition.opacity !== undefined) {
    components.push(k.opacity(definition.opacity))
  }

  if (definition.solid) {
    components.push(k.area(), k.body({ isStatic: true }))
  }

  components.push(k.z(definition.z), ...(definition.tags ?? []))
  return components
}
