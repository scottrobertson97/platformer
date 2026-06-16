import { TileManager } from './tileManager'

export function createFactoryTileManager() {
  return new TileManager()
    .register({
      id: 'background-panel',
      layer: 'background',
      symbol: '.',
      sprite: 'tile-4',
      opacity: 0.36,
      z: -20,
    })
    .register({
      id: 'factory-floor',
      layer: 'solid',
      symbol: '#',
      sprite: 'tile-42',
      solid: true,
      tags: ['solid'],
      z: 0,
    })
    .register({
      id: 'remembering-door',
      layer: 'decor',
      symbol: 'D',
      sprite: 'tile-69',
      tags: ['door', 'remembering-door'],
      z: 10,
    })
    .register({
      id: 'password',
      layer: 'decor',
      symbol: 'P',
      sprite: 'tile-74',
      tags: ['password'],
      z: 10,
    })
    .register({
      id: 'hazard-sign',
      layer: 'decor',
      symbol: 'h',
      sprite: 'tile-51',
      tags: ['hazard-sign'],
      z: 10,
    })
    .register({
      id: 'pipe',
      layer: 'decor',
      symbol: 'p',
      sprite: 'tile-61',
      tags: ['pipe'],
      z: 10,
    })
    .register({
      id: 'route-marker',
      layer: 'decor',
      symbol: 'r',
      sprite: 'tile-83',
      tags: ['route-marker'],
      z: 10,
    })
    .register({
      id: 'spikes',
      layer: 'decor',
      symbol: 's',
      sprite: 'tile-37',
      tags: ['spikes'],
      z: 10,
    })
    .register({
      id: 'valve',
      layer: 'decor',
      symbol: 'v',
      sprite: 'tile-71',
      tags: ['valve'],
      z: 10,
    })
}
