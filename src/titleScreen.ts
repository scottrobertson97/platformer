import type { GameLevel } from './level'

export const TITLE_SCENE = 'title'

export type TitleScreenLevel = {
  identifier: string
  columns: number
  rows: number
}

export type TitleScreenState = {
  visible: boolean
  selectedLevelIdentifier: string
  levels: TitleScreenLevel[]
}

export type TitleScreenOptions = {
  root: HTMLElement
  levels: GameLevel[]
  selectedLevelIdentifier: string
  onSelectLevel: (identifier: string) => void
}

export type TitleScreenController = {
  show: (selectedLevelIdentifier: string) => void
  hide: () => void
  getState: () => TitleScreenState
}

export function createTitleScreen({
  root,
  levels,
  selectedLevelIdentifier,
  onSelectLevel,
}: TitleScreenOptions): TitleScreenController {
  if (levels.length === 0) {
    throw new Error('Title screen requires at least one level.')
  }

  const element = document.createElement('section')
  element.className = 'title-screen'
  element.dataset.testid = 'title-screen'
  element.setAttribute('aria-label', 'Ashen Factory title screen')
  element.hidden = true

  const panel = document.createElement('div')
  panel.className = 'title-screen__panel'

  const eyebrow = document.createElement('p')
  eyebrow.className = 'title-screen__eyebrow'
  eyebrow.textContent = 'Game Jam Prototype'

  const title = document.createElement('h1')
  title.className = 'title-screen__title'
  title.textContent = 'Ashen Factory'

  const subtitle = document.createElement('p')
  subtitle.className = 'title-screen__subtitle'
  subtitle.textContent = 'A door that remembers. A password buried in smoke.'

  const levelList = document.createElement('div')
  levelList.className = 'title-screen__levels'
  levelList.setAttribute('role', 'listbox')
  levelList.setAttribute('aria-label', 'Levels')

  let selectedIndex = getLevelIndex(selectedLevelIdentifier)
  const buttons = levels.map((level, index) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'title-screen__level'
    button.dataset.levelIdentifier = level.identifier
    button.setAttribute('role', 'option')

    const name = document.createElement('span')
    name.className = 'title-screen__level-name'
    name.textContent = formatLevelName(level.identifier)

    const meta = document.createElement('span')
    meta.className = 'title-screen__level-meta'
    meta.textContent = `${level.columns} x ${level.rows}`

    button.append(name, meta)
    button.addEventListener('click', () => {
      selectedIndex = index
      syncSelection()
      onSelectLevel(level.identifier)
    })
    button.addEventListener('focus', () => {
      selectedIndex = index
      syncSelection()
    })

    levelList.append(button)
    return button
  })

  panel.append(eyebrow, title, subtitle, levelList)
  element.append(panel)
  root.append(element)
  syncSelection()

  document.addEventListener('keydown', event => {
    if (element.hidden) {
      return
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault()
      selectedIndex = (selectedIndex + 1) % buttons.length
      syncSelection(true)
      return
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault()
      selectedIndex = (selectedIndex + buttons.length - 1) % buttons.length
      syncSelection(true)
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      onSelectLevel(levels[selectedIndex].identifier)
    }
  })

  function show(selectedLevelIdentifier: string) {
    const nextSelectedIndex = levels.findIndex(
      level => level.identifier === selectedLevelIdentifier,
    )

    selectedIndex = nextSelectedIndex >= 0 ? nextSelectedIndex : selectedIndex
    element.hidden = false
    syncSelection(true)
  }

  function hide() {
    if (document.activeElement instanceof HTMLElement) {
      if (element.contains(document.activeElement)) {
        document.activeElement.blur()
      }
    }

    element.hidden = true
  }

  function getState(): TitleScreenState {
    return {
      visible: !element.hidden,
      selectedLevelIdentifier: levels[selectedIndex].identifier,
      levels: levels.map(level => ({
        identifier: level.identifier,
        columns: level.columns,
        rows: level.rows,
      })),
    }
  }

  function syncSelection(focusSelected = false) {
    const selectedLevelIdentifier = levels[selectedIndex].identifier

    levelList.setAttribute('aria-activedescendant', selectedLevelIdentifier)

    for (const [index, button] of buttons.entries()) {
      const isSelected = index === selectedIndex
      button.id = levels[index].identifier
      button.setAttribute('aria-selected', String(isSelected))
      button.tabIndex = isSelected ? 0 : -1
    }

    if (focusSelected) {
      buttons[selectedIndex].focus({ preventScroll: true })
    }
  }

  function getLevelIndex(identifier: string) {
    const index = levels.findIndex(level => level.identifier === identifier)
    return index >= 0 ? index : 0
  }

  return { show, hide, getState }
}

export function formatLevelName(identifier: string) {
  return identifier.replace(/_/g, ' ')
}
