import { TileManager } from './tileManager'
import { factoryTile } from './spriteKeys'

export function createFactoryTileManager() {
  return new TileManager()
    .register({
      id: 'background-panel',
      layer: 'background',
      symbol: '.',
      sprite: factoryTile(4, 0),
      opacity: 0.36,
      z: -20,
    })
    .register({
      id: 'factory-floor',
      layer: 'solid',
      symbol: '#',
      sprite: factoryTile(0, 3),
      solid: true,
      tags: ['solid'],
      z: 0,
    })
    .register({
      id: 'dirt-floor',
      layer: 'solid',
      symbol: '_',
      sprite: factoryTile(2, 0),
      solid: true,
      tags: ['solid'],
      z: 0,
    })
    .register({
      id: 'background-dirt',
      layer: 'solid',
      symbol: ',',
      sprite: factoryTile(4, 0),
      solid: true,
      tags: ['solid'],
      z: 0,
    })
    .register({
      id: 'remembering-door',
      layer: 'decor',
      symbol: 'D',
      sprite: factoryTile(13, 4),
      tags: ['door', 'remembering-door'],
      z: 10,
    })
    .register({
      id: 'password',
      layer: 'decor',
      symbol: 'P',
      sprite: factoryTile(4, 5),
      tags: ['password'],
      z: 10,
    })
    .register({
      id: 'hazard-sign',
      layer: 'decor',
      symbol: 'h',
      sprite: factoryTile(9, 3),
      tags: ['hazard-sign'],
      z: 10,
    })
    .register({
      id: 'pipe',
      layer: 'decor',
      symbol: 'p',
      sprite: factoryTile(5, 4),
      tags: ['pipe'],
      z: 10,
    })
    .register({
      id: 'route-marker',
      layer: 'decor',
      symbol: 'r',
      sprite: factoryTile(13, 5),
      tags: ['route-marker'],
      z: 10,
    })
    .register({
      id: 'spikes',
      layer: 'decor',
      symbol: 's',
      sprite: factoryTile(9, 2),
      tags: ['spikes'],
      z: 10,
    })
    .register({
      id: 'valve',
      layer: 'decor',
      symbol: 'v',
      sprite: factoryTile(1, 5),
      tags: ['valve'],
      z: 10,
    })
}
