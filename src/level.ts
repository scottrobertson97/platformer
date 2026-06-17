export const TILE_SIZE = 70

export const LEVEL_WIDTH = 38
export const LEVEL_HEIGHT = 13

export const BACKGROUND_MAP = [
  '......................................',
  '......................................',
  '......................................',
  '......................................',
  '......................................',
  '......................................',
  '......................................',
  '......................................',
  '......................................',
  '......................................',
  '......................................',
  '......................................',
  '......................................',
]

export const SOLID_MAP = [
  '                                      ',
  '                                      ',
  '                                      ',
  '                                      ',
  '       ####               ####        ',
  '                         #    #       ',
  '   @                 ###              ',
  '#####        ####                     ',
  '                                      ',
  '            #######          #####    ',
  '                                      ',
  '______________________________________',
  ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
]

export const DECOR_MAP = [
  '                                      ',
  '                                      ',
  '     p                    r           ',
  '                                      ',
  '                s     s               ',
  '                            D         ',
  '                                      ',
  '        v          P                  ',
  '                                      ',
  '   h                         h        ',
  '                                      ',
  '                                      ',
  '                                      ',
]

export type TilePoint = {
  x: number
  y: number
}

export function findTile(map: string[], symbol: string): TilePoint {
  for (let y = 0; y < map.length; y += 1) {
    const x = map[y].indexOf(symbol)

    if (x >= 0) {
      return { x, y }
    }
  }

  throw new Error(`Missing tile symbol "${symbol}"`)
}

export function stripTile(map: string[], symbol: string): string[] {
  return map.map(row => row.replace(symbol, ' '))
}
