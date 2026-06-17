/// <reference types="vite/client" />

interface Window {
  render_game_to_text?: () => string;
  advanceTime?: (ms: number) => void;
}

declare module '*.ldtk?raw' {
  const value: string
  export default value
}

declare module '*.ldtkl?raw' {
  const value: string
  export default value
}
