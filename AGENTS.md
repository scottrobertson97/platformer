# AGENTS.md

## Project Overview

This is a small Vite + TypeScript + KAPLAY platformer prototype for a game jam prompt:

- Theme: `ashen factory`
- Wildcard: `a door that remembers`
- Ingredient: `a password`

The current goal is a playable industrial platformer with LDtk-authored levels rendered directly from LDtk `Tiles` layers. The next gameplay direction in `progress.md` is to implement the remembering door and password interaction mechanics.

## Working Directory

Assume commands are run from the repository root:

```powershell
D:\Documents\GitHub\platformer
```

## Common Commands

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Build for verification: `npm run build`
- Preview production build: `npm run preview`

Run `npm run build` before handing off code changes unless the user explicitly asks for a quick draft.

## Tech Stack

- Vite
- TypeScript with strict compiler settings
- KAPLAY.js
- Root tilesheet assets: `platformerPack_industrial_tilesheet.png`, `spritesheet_complete.png`

Avoid introducing a new game engine, renderer, bundler, or map pipeline unless the user specifically asks for that change.

## Source Layout

- `levels.ldtk`: root LDtk project file with the current embedded level data.
- `src/main.ts`: KAPLAY setup, scene creation, player movement, camera, atlas loading, rendering of map layers, and browser/playtest hooks.
- `src/level.ts`: loads the root LDtk project, resolves optional external levels if referenced, then exports parsed level helpers.
- `src/ldtk.ts`: small LDtk adapter that exposes LDtk `Tiles` layers and entities to the runtime.
- `src/titleScreen.ts`: DOM title screen and level-selection controls.
- `src/pauseMenu.ts`: DOM pause menu with resume and level-selection exit controls.
- `src/style.css`: page and canvas styling.
- `progress.md`: short project history and current TODOs.
- `index.html`: Vite entrypoint with the `#game` root.

## Code Style

- Keep TypeScript strict-clean under the existing `tsconfig.json`.
- Prefer small, direct functions over broad abstractions.
- Match the file's current formatting when editing it. Do not perform unrelated formatting sweeps.
- Keep comments sparse and useful. Add them only when behavior would otherwise be hard to infer.
- Preserve the KAPLAY instance as `global: false`; use the local `k` object for engine calls.
- Keep user-facing controls discoverable through the existing test hook metadata in `window.render_game_to_text`.

## Map Editing

The chosen map workflow is LDtk project JSON from root `levels.ldtk`.

- The current project keeps level data embedded in `levels.ldtk`.
- If LDtk external levels are enabled again, keep each `externalRelPath` backed by a matching `.ldtkl` file.
- Keep the runtime-rendered LDtk tile layers on the industrial tileset unless support is intentionally added for another tileset.
- Required LDtk layers:
  - `Bg`: background `Tiles` layer.
  - `Fg`: foreground `Tiles` layer with solid collision.
  - `Decor`: non-solid decor `Tiles` layer.
  - `Entities`: contains a `PlayerSpawn` entity.
- `PlayerSpawn` uses pixel coordinates for the top-left of the player physics body.
- Scene names match LDtk level identifiers, starting with `Level_0`.
- To manually test another level, run the dev server and open `/?level=Level_1`.
- Keep collisions in the solid layer unless there is a clear gameplay reason to do otherwise.

## Screen Flow

- The game starts at the `title` scene when no `?level=` query is provided.
- The title screen renders level-selection buttons from parsed LDtk levels.
- Selecting a level starts the matching KAPLAY scene and updates `?level=...`.
- During gameplay, `escape` opens the pause menu.
- The pause menu can resume or return to the title/level-selection screen.
- Direct `?level=Level_1` links still start that level immediately for smoke tests and sharing.

## Gameplay Conventions

- Existing controls:
  - Move: `a`, `d`, left arrow, right arrow
  - Jump: `w`, up arrow, space
  - Restart: `r`
  - Fullscreen: `f`
  - Pause: escape
- Maintain the current platformer feel unless the task is specifically about tuning movement.
- When adding mechanics, make them readable in the simple playtest hooks. Extend `window.render_game_to_text` with stable state when tests or future agents need to inspect behavior.
- For the "door that remembers" and password mechanics, prefer a minimal playable loop first: interaction state, clear feedback, and deterministic behavior that can be tested.

## Verification

At minimum after code changes:

```powershell
npm run build
```

For gameplay changes, also run the app in a browser and verify:

- The title screen renders.
- Each listed level can be selected.
- The pause menu opens with `escape`, freezes gameplay, resumes, and can return to level selection.
- The canvas renders.
- The player can move, jump, land, and restart.
- Camera follow still works.
- The player cannot leave the level horizontally.
- Fall reset still works.
- Any new mechanic can be reached and observed from normal play.

The game exposes test hooks on `window`:

- `window.render_game_to_text()`: returns JSON describing scene, map, controls, and player state.
- `window.advanceTime(ms)`: steps KAPLAY debug frames for scripted tests.

Use these hooks for Playwright-style smoke tests when practical.

## Git And Safety

- The worktree may already contain user edits. Check `git status --short` before editing.
- Do not revert or overwrite unrelated changes.
- Keep changes scoped to the requested task.
- Do not commit, branch, or push unless the user asks.
