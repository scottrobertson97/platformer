export type PauseMenuState = {
  visible: boolean
  currentLevelIdentifier: string | null
}

export type PauseMenuOptions = {
  root: HTMLElement
  onResume: () => void
  onLevelSelect: () => void
}

export type PauseMenuController = {
  show: (currentLevelIdentifier: string) => void
  hide: () => void
  getState: () => PauseMenuState
}

export function createPauseMenu({
  root,
  onResume,
  onLevelSelect,
}: PauseMenuOptions): PauseMenuController {
  const element = document.createElement('section')
  element.className = 'pause-menu'
  element.dataset.testid = 'pause-menu'
  element.setAttribute('aria-label', 'Paused')
  element.hidden = true

  const panel = document.createElement('div')
  panel.className = 'pause-menu__panel'

  const eyebrow = document.createElement('p')
  eyebrow.className = 'pause-menu__eyebrow'
  eyebrow.textContent = 'Paused'

  const title = document.createElement('h2')
  title.className = 'pause-menu__title'
  title.textContent = 'Factory Hold'

  const levelName = document.createElement('p')
  levelName.className = 'pause-menu__level'

  const actions = document.createElement('div')
  actions.className = 'pause-menu__actions'

  const resumeButton = document.createElement('button')
  resumeButton.type = 'button'
  resumeButton.className = 'pause-menu__button pause-menu__button--primary'
  resumeButton.textContent = 'Resume'
  resumeButton.addEventListener('click', onResume)

  const levelSelectButton = document.createElement('button')
  levelSelectButton.type = 'button'
  levelSelectButton.className = 'pause-menu__button'
  levelSelectButton.textContent = 'Level Select'
  levelSelectButton.addEventListener('click', onLevelSelect)

  actions.append(resumeButton, levelSelectButton)
  panel.append(eyebrow, title, levelName, actions)
  element.append(panel)
  root.append(element)

  let currentLevelIdentifier: string | null = null

  document.addEventListener('keydown', event => {
    if (element.hidden || event.key !== 'Escape') {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
    onResume()
  })

  function show(nextLevelIdentifier: string) {
    currentLevelIdentifier = nextLevelIdentifier
    levelName.textContent = nextLevelIdentifier.replace(/_/g, ' ')
    element.hidden = false
    resumeButton.focus({ preventScroll: true })
  }

  function hide() {
    if (document.activeElement instanceof HTMLElement) {
      if (element.contains(document.activeElement)) {
        document.activeElement.blur()
      }
    }

    element.hidden = true
    currentLevelIdentifier = null
  }

  function getState(): PauseMenuState {
    return {
      visible: !element.hidden,
      currentLevelIdentifier,
    }
  }

  return { show, hide, getState }
}
