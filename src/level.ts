import levelsProjectJson from '../levels.ldtk?raw'
import {
  loadLdtkLevels,
  type GameLevel,
} from './ldtk'

export type { GameLevel, LevelPoint } from './ldtk'

const externalLevelJsonByPath = import.meta.glob<string>(
  '../levels/*.ldtkl',
  {
    eager: true,
    import: 'default',
    query: '?raw',
  },
)

export const LEVELS = loadLdtkLevels(levelsProjectJson, externalLevelJsonByPath)
export const START_LEVEL_IDENTIFIER = 'Level_0'
export const START_LEVEL = getLevelByIdentifier(START_LEVEL_IDENTIFIER)
export const TILE_SIZE = START_LEVEL.tileSize

export function getLevelByIdentifier(identifier: string): GameLevel {
  const level = LEVELS.find(candidate => candidate.identifier === identifier)

  if (!level) {
    const available = LEVELS.map(candidate => candidate.identifier).join(', ')
    throw new Error(
      `Missing level "${identifier}". Available levels: ${available}`,
    )
  }

  return level
}
