# Godot 2D Port Plan

This plan ports the current Vite + TypeScript + KAPLAY prototype into a Godot 2D project while preserving the game that exists today:

- Theme: `ashen factory`
- Wildcard: `a door that remembers`
- Ingredient: `a password`
- Current map source: root `levels.ldtk`
- Current level count: `Level_0`, `Level_1`, `Level_2`, `Level_3`
- Current level layers: `Bg`, `Fg`, `Decor`, `Entities`
- Current player spawn entity: `PlayerSpawn`
- Current playable loop: title screen -> level selection -> platforming -> pause/restart/fullscreen/fall reset

The goal is a direct port first, then the remembering door/password mechanics on top of the Godot version. Avoid changing the level design, physics feel, or screen flow until the Godot build reaches parity with the existing prototype.

## Target Shape

Use Godot 4.x 2D with GDScript unless there is a strong reason to add C# later. The repository already has an untracked `new-game-project/` folder with a `project.godot` stub that appears to be a Godot 4.7 GL Compatibility project. It can be reused as the destination if desired, but the port should first decide whether that folder name should become the permanent Godot project folder or whether it should be renamed to something like `godot/`.

Recommended final layout:

```text
platformer/
  levels.ldtk
  platformerPack_industrial_tilesheet.png
  spritesheet_complete.png
  GODOT_PORT_PLAN.md
  godot/
    project.godot
    assets/
      tiles/platformerPack_industrial_tilesheet.png
      sprites/spritesheet_complete.png
    data/
      levels.ldtk
    scenes/
      main.tscn
      world/level_world.tscn
      player/player.tscn
      ui/title_screen.tscn
      ui/pause_menu.tscn
      ui/hud_layer.tscn
      interactables/remembering_door.tscn
      interactables/password_terminal.tscn
    scripts/
      config.gd
      main.gd
      level_catalog.gd
      ldtk_loader.gd
      level_world.gd
      tile_layer_builder.gd
      player_controller.gd
      camera_controller.gd
      title_screen.gd
      pause_menu.gd
      debug_snapshot.gd
      test_hooks.gd
      door_memory.gd
      password_terminal.gd
      remembering_door.gd
    resources/
      factory_tileset.tres
      player_sprite_frames.tres
      ui_theme.tres
```

If keeping `new-game-project/`, apply the same internal layout there and rename the project title from `New Game Project` to `Ashen Factory Platformer`.

## Non-Negotiable Parity Targets

The Godot version should match these before the TypeScript version is retired:

1. Title screen starts when no level query/launch argument is supplied.
2. Title screen lists all parsed LDtk levels and displays each level's grid size.
3. Selecting a level starts the matching level.
4. `Level_0` remains the default start level.
5. Direct level launch remains possible for smoke tests.
6. `Bg`, `Fg`, and `Decor` render from LDtk tile data using the industrial tilesheet.
7. `Fg` is the only solid tile layer.
8. `PlayerSpawn` places the player using LDtk pixel coordinates as the top-left of the player body.
9. Player moves left/right, jumps, lands, and restarts.
10. Player cannot leave the level horizontally.
11. Falling below the level resets the player.
12. Camera follows with the same horizontal safe zone and clamps to level bounds.
13. Escape opens pause, pause freezes gameplay, resume restores gameplay.
14. Pause can return to level selection.
15. Fullscreen remains available.
16. A test/debug snapshot can describe scene, map, controls, player, camera, menu, and pause state.

## Current Source Breakdown And Godot Equivalents

### `package.json`

Current role:

- Defines the Vite/TypeScript app.
- Provides `npm run dev`, `npm run build`, and `npm run preview`.
- Depends on `kaplay`.

Godot equivalent:

- No runtime equivalent after the port.
- Replace Vite commands with Godot editor/CLI workflows:
  - Open project: `godot --editor --path godot`
  - Run project: `godot --path godot`
  - Export web/native builds through Godot export presets.
- Keep `package.json` during the migration so the existing prototype can stay testable.
- Remove or archive it only after Godot parity is complete and the team chooses to retire the web/KAPLAY version.

Port tasks:

1. Add a Godot project folder and project settings.
2. Add export presets later.
3. Update documentation to show both old and new commands during the transition.

### `vite.config.ts`

Current role:

- Sets `base` to `/platformer/` for production builds and `/` during dev.

Godot equivalent:

- Godot web export path and custom HTML shell settings.
- If publishing to GitHub Pages, configure Godot web export output so asset paths work under `/platformer/`.

Port tasks:

1. Create Godot web export preset.
2. Test the exported build from a subpath if GitHub Pages remains the target.
3. Keep a small deployment note that replaces the current Vite `base` behavior.

### `index.html`

Current role:

- Owns the `#game` root.
- Loads `/src/main.ts`.
- Supplies the browser page title.

Godot equivalent:

- Godot's generated web export HTML shell.
- Optional custom shell if direct `?level=Level_1` links and `window.render_game_to_text()` need to be preserved for browser smoke tests.

Port tasks:

1. Set the Godot application name to `Ashen Factory Platformer`.
2. For web exports, preserve query parsing with either:
   - a custom HTML shell that passes query parameters into Godot, or
   - a Godot `JavaScriptBridge` read of `window.location.search`.
3. Recreate browser test hooks if Playwright smoke tests remain part of the workflow.

### `src/main.ts`

Current role:

- Creates the KAPLAY context with:
  - `width: 960`
  - `height: 540`
  - letterbox enabled
  - crisp pixel rendering
  - local `k` object with `global: false`
  - background color `[22, 26, 28]`
- Loads both sprite atlases.
- Sets gravity to `1600`.
- Tracks selected level, active level, and player.
- Registers title and level scenes.
- Builds the title screen and pause menu.
- Registers test hooks.
- Starts title scene unless `?level=` is provided.
- Handles level query updates.

Godot equivalent:

- `scenes/main.tscn`
- `scripts/main.gd`
- Optionally an autoload `GameState.gd` or `LevelCatalog.gd`

Suggested Godot node tree:

```text
Main (Node)
  WorldRoot (Node2D)
  UILayer (CanvasLayer)
    TitleScreen (Control)
    PauseMenu (Control)
```

Main responsibilities:

- Load `levels.ldtk` through `LevelCatalog`.
- Store `selected_level_id` and `active_level_id`.
- Show title screen when no direct level launch is requested.
- Start a level by clearing `WorldRoot`, instancing `LevelWorld`, and passing the selected `LevelData`.
- Instance `Player` at the parsed spawn point.
- Attach or configure the level camera.
- Toggle pause and set `get_tree().paused`.
- Route restart/fullscreen input.
- Keep debug snapshot data current.

Port tasks:

1. Create `main.tscn` and set it as the Godot main scene.
2. Move the current screen flow into `main.gd`.
3. Implement direct level start from:
   - launch argument like `--level=Level_1` for native/editor tests, and
   - URL query `?level=Level_1` for web export if needed.
4. Recreate current controls through Godot InputMap.
5. Keep all level switching centralized in `main.gd`.

### `src/config.ts`

Current role:

- Defines viewport, gravity, movement, player size, atlas grid sizes, animation frames, camera safe zone, and background color.

Current values:

```text
VIEW_WIDTH = 960
VIEW_HEIGHT = 540
GRAVITY = 1600
PLAYER_SPEED = 330
PLAYER_JUMP_FORCE = 760
PLAYER_WIDTH = 70
PLAYER_HEIGHT = 140
PLAYER_WALK_FRAME_SECONDS = 0.14
CAMERA_HORIZONTAL_SAFEZONE_RATIO = 0.4
BACKGROUND_COLOR = [22, 26, 28]
```

Godot equivalent:

- `scripts/config.gd`
- Project settings:
  - viewport width: `960`
  - viewport height: `540`
  - stretch mode: `canvas_items`
  - stretch aspect: likely `expand`, matching the existing Godot stub
  - texture filter: nearest/pixel style for imported pixel art

Port tasks:

1. Create a constants script or autoload with the same values.
2. Configure project window/stretch settings.
3. Set the default clear color to `#161a1c` or equivalent RGB `22, 26, 28`.
4. Confirm tile size derives from the LDtk solid layer grid size, currently `70`.

### `src/level.ts`

Current role:

- Imports root `levels.ldtk` as raw JSON.
- Optionally imports external `levels/*.ldtkl`.
- Loads parsed levels through the LDtk adapter.
- Exports:
  - `LEVELS`
  - `START_LEVEL_IDENTIFIER = "Level_0"`
  - `START_LEVEL`
  - `TILE_SIZE`
  - `getLevelByIdentifier()`

Godot equivalent:

- `scripts/level_catalog.gd`
- `scripts/ldtk_loader.gd`
- Optional `LevelData` Resource class if dictionaries become hard to manage.

Port tasks:

1. Copy or reference `levels.ldtk` from inside the Godot project, likely `res://data/levels.ldtk`.
2. Load with `FileAccess.get_file_as_string()`.
3. Parse with `JSON.parse_string()`.
4. Keep `START_LEVEL_IDENTIFIER = "Level_0"`.
5. Build a level list at startup.
6. Implement `get_level_by_identifier(id)` with the same explicit missing-level error behavior.
7. Preserve optional external-level support as a second step, even though current `externalLevels` is `false`.

### `src/ldtk.ts`

Current role:

- Defines LDtk and runtime level types.
- Parses LDtk project JSON.
- Normalizes external level paths.
- Loads either embedded or external levels.
- Requires:
  - `Bg` Tiles layer
  - `Fg` Tiles layer
  - `Decor` Tiles layer
  - `Entities` layer with `PlayerSpawn`
- Converts LDtk grid tiles into runtime cells:
  - `x`, `y`
  - `spriteX`, `spriteY`
  - `flipX`, `flipY`
  - `tilesetRelPath`
- Uses LDtk `pxWid` and `pxHei` as world dimensions.

Current LDtk facts:

```text
externalLevels = false
tileset platformerPack_industrial_tilesheet.png: 980x560, 70 px grid, 14 columns x 8 rows
tileset spritesheet_complete.png: 4096x2048, LDtk def says 130 px grid, runtime player atlas currently uses 128 px cells
Level_0: 984x616, 15x9 cells, spawn [350, 280]
Level_1: 1306x676, 19x10 cells, spawn [350, 420]
Level_2: 1726x956, 25x14 cells, spawn [490, 770]
Level_3: 3826x1236, 55x18 cells, spawn [910, 980]
Bg opacity = 0.1
Fg opacity = 1
Decor opacity = 1
```

Godot equivalent:

- `scripts/ldtk_loader.gd`
- `scripts/level_catalog.gd`

Important port details:

- Godot 2D coordinates also use positive X right and positive Y down, so LDtk pixel coordinates can remain direct world coordinates.
- Preserve LDtk `pxWid` and `pxHei` for world width/height. Do not replace them with `columns * tile_size` because current levels are not exact multiples of 70.
- Preserve layer identity by name, not by order.
- Preserve rendering order explicitly:
  - `Bg` z index `-20`
  - `Fg` z index `0`
  - `Decor` z index `10`
  - player z index `20`
- Preserve LDtk tile flip flags:
  - horizontal: `(f & 1) != 0`
  - vertical: `(f & 2) != 0`
  - if diagonal/transpose flags appear later, add support intentionally.

Port tasks:

1. Write a Godot LDtk parser that validates the same required layers/entities.
2. Convert tile source pixel coordinates into atlas coordinates by dividing by the tileset grid size.
3. Assert that level tile layers use `platformerPack_industrial_tilesheet.png`.
4. Keep errors loud for missing layers, missing tilesets, or non-grid-aligned tile sources.
5. Add support for future entities such as doors, terminals, enemies, and password hints after render parity is complete.

### `src/world.ts`

Current role:

- Adds background, solid, and decor tile layers.
- Renders each LDtk tile as a KAPLAY sprite.
- Adds `area()` and static `body()` only for solid `Fg` tiles.
- Rejects any tileset other than `platformerPack_industrial_tilesheet.png`.

Godot equivalent:

- `scenes/world/level_world.tscn`
- `scripts/level_world.gd`
- `scripts/tile_layer_builder.gd`
- `resources/factory_tileset.tres`

Suggested Godot node tree:

```text
LevelWorld (Node2D)
  Bg (TileMapLayer or Node2D)
  Fg (TileMapLayer or Node2D)
  Decor (TileMapLayer or Node2D)
  Entities (Node2D)
  Bounds (Node2D, optional)
```

Tile rendering options:

1. Preferred long-term: Godot `TileMapLayer` nodes with a `TileSet` atlas source.
2. Simple deterministic first pass: instantiate `Sprite2D` nodes for each LDtk tile and create static collision rectangles for `Fg`.

The preferred option is better for editor tooling and performance. The simple option may be faster if LDtk tile flip handling or TileSet generation blocks early progress.

Collision choices:

1. Add a full-tile physics shape to each tile in the `factory_tileset.tres`, then let the `Fg` TileMapLayer collide.
2. Or generate a `StaticBody2D`/`CollisionShape2D` rectangle per `Fg` tile.

For this small jam prototype, either is acceptable. If using generated collision nodes, merge adjacent solid rectangles later only if performance becomes an issue.

Port tasks:

1. Import `platformerPack_industrial_tilesheet.png` with nearest filtering.
2. Create `factory_tileset.tres` with 70x70 atlas tiles.
3. Render LDtk `Bg`, `Fg`, and `Decor` cells.
4. Apply opacity to `Bg` as `modulate.a = 0.1`.
5. Apply flip flags to tiles. If Godot TileMap transformed alternatives are awkward, use Sprite2D cells until this is solved.
6. Add solid collision only for `Fg`.
7. Keep `Decor` non-solid.

### `src/atlas.ts`

Current role:

- Generates KAPLAY atlas entries for:
  - industrial tilesheet: 14 columns x 8 rows, 70 px tile size
  - complete spritesheet: 32 columns x 16 rows, 128 px tile size
- Contains a workaround for KAPLAY rectangular atlas coordinate normalization.

Godot equivalent:

- Godot import settings and resource files:
  - `resources/factory_tileset.tres`
  - `resources/player_sprite_frames.tres`
  - optional `AtlasTexture` resources for player frame parts

Port tasks:

1. Create a TileSet atlas source for `platformerPack_industrial_tilesheet.png`.
2. Use 70x70 tile regions for factory tiles.
3. For player parts, slice `spritesheet_complete.png` as 128x128 regions because the current runtime uses 128, despite LDtk's tileset definition saying 130.
4. Verify the player top/bottom frames visually after import.
5. Drop the KAPLAY-specific x-coordinate workaround.

### `src/spriteKeys.ts`

Current role:

- Builds stable KAPLAY sprite keys like `tile-3-4` and `spritesheet-4-2`.
- Validates sprite coordinates.

Godot equivalent:

- Usually no direct equivalent.
- Atlas coordinates are `Vector2i(column, row)`.
- Player frames can be named resources or enum-like constants.

Port tasks:

1. Replace string sprite keys with atlas coordinates.
2. Keep named constants for player animation frames:
   - idle top: `(4, 2)`
   - idle bottom: `(4, 3)`
   - walk frame 0 top/bottom: `(3, 2)`, `(3, 3)`
   - walk frame 1 top/bottom: `(3, 4)`, `(3, 5)`
3. Add validation only if generating textures procedurally.

### `src/player.ts`

Current role:

- Creates a 70x140 player body.
- Uses KAPLAY `area()` and `body({ jumpForce: 760 })`.
- Adds two child sprites:
  - top part at y `0`
  - bottom part at y `70`
- Uses `PLAYER_SPRITE_SCALE = 70 / 128`.
- Moves horizontally at `330`.
- Jumps when grounded.
- Clamps X to `0..worldWidth - 70`.
- Resets position and velocity.
- Tracks facing, walking state, animation timer, and current frame.
- Exposes rounded player state for tests.

Godot equivalent:

- `scenes/player/player.tscn`
- `scripts/player_controller.gd`

Suggested node tree:

```text
Player (CharacterBody2D)
  CollisionShape2D
  Visuals (Node2D)
    TopSprite (Sprite2D)
    BottomSprite (Sprite2D)
```

Important origin decision:

- The current runtime treats the player's position as the top-left of the physics body.
- Godot `CharacterBody2D` usually treats `position` as the node origin, and collision shapes are centered by default.
- To preserve LDtk spawns exactly, use the `Player` node origin as top-left:
  - `CollisionShape2D.position = Vector2(35, 70)`
  - rectangle shape size = `Vector2(70, 140)`
  - `TopSprite.position = Vector2(35, 35)` or use centered atlas textures with matching offsets
  - `BottomSprite.position = Vector2(35, 105)`
- Alternatively, use a centered origin and convert spawn points. The top-left-origin option is less surprising because it matches current LDtk behavior.

Movement script behavior:

```text
velocity.x = input_axis * 330
velocity.y += 1600 * delta
if jump pressed and is_on_floor(): velocity.y = -760
move_and_slide()
position.x = clamp(position.x, 0, world_width - 70)
if position.y > level_height + tile_size: reset_to_spawn()
```

Port tasks:

1. Build the CharacterBody2D player scene.
2. Configure collision layers/masks to collide with the `Fg` world layer.
3. Implement left/right movement.
4. Implement jump with negative Y velocity.
5. Implement restart.
6. Implement fall reset.
7. Recreate top/bottom sprite animation.
8. Flip both sprite parts when facing left.
9. Expose `get_state()` returning:
   - x
   - y
   - vx
   - vy
   - grounded

### `src/camera.ts`

Current role:

- Centers camera on the player on spawn.
- Follows horizontally only when the player leaves a safe zone.
- Safe zone width is `viewport_width * 0.4`.
- Vertically follows the player center directly, clamped to world bounds.
- Clamps both axes so the camera never shows outside the level.
- If the world is smaller than the viewport, centers the camera on the world.
- Exposes camera state for tests.

Godot equivalent:

- `scripts/camera_controller.gd`
- `Camera2D`, either as a child of `LevelWorld` or a sibling configured by `Main`.

Port tasks:

1. Add a `Camera2D` and make it current for active levels.
2. Implement the same safe-zone algorithm rather than relying only on Camera2D drag margins, at least for parity.
3. Use player center:
   - x = player.position.x + `PLAYER_WIDTH / 2`
   - y = player.position.y + `PLAYER_HEIGHT / 2`
4. Clamp against LDtk `pxWid`/`pxHei`.
5. Snap camera after player spawn and restart.
6. Expose `get_state()` returning:
   - x
   - y
   - safezone_width
   - safezone_left
   - safezone_right

### `src/titleScreen.ts`

Current role:

- Creates DOM title screen.
- Text:
  - eyebrow: `Game Jam Prototype`
  - title: `Ashen Factory`
  - subtitle: `A door that remembers. A password buried in smoke.`
- Builds one button per parsed LDtk level.
- Shows formatted level names like `Level 0`.
- Shows level metadata as `columns x rows`.
- Supports mouse click, focus, arrow navigation, and Enter start.
- Exposes menu state for tests.

Godot equivalent:

- `scenes/ui/title_screen.tscn`
- `scripts/title_screen.gd`
- `resources/ui_theme.tres`

Suggested Control tree:

```text
TitleScreen (Control)
  DimBackground (ColorRect)
  Panel (PanelContainer)
    VBoxContainer
      EyebrowLabel
      TitleLabel
      SubtitleLabel
      LevelList (VBoxContainer)
```

Port tasks:

1. Rebuild the title UI with Control nodes.
2. Generate level buttons from `LevelCatalog`.
3. Preserve the exact visible text unless intentionally changing copy.
4. Preserve keyboard navigation using Godot focus.
5. Emit `level_selected(level_id)` to `Main`.
6. Expose `get_state()` returning:
   - visible
   - selected_level_identifier
   - levels with identifier, columns, rows

### `src/pauseMenu.ts`

Current role:

- Creates DOM pause overlay.
- Text:
  - eyebrow: `Paused`
  - title: `Factory Hold`
  - actions: `Resume`, `Level Select`
- Escape resumes when menu is visible.
- Buttons call resume or return to level selection.
- Exposes pause state for tests.

Godot equivalent:

- `scenes/ui/pause_menu.tscn`
- `scripts/pause_menu.gd`

Suggested Control tree:

```text
PauseMenu (Control)
  DimBackground (ColorRect)
  Panel (PanelContainer)
    VBoxContainer
      EyebrowLabel
      TitleLabel
      LevelLabel
      ResumeButton
      LevelSelectButton
```

Pause behavior:

- Set `get_tree().paused = true` when opened.
- Set pause menu `process_mode = Node.PROCESS_MODE_WHEN_PAUSED`.
- Resume button and Escape should set `get_tree().paused = false`.
- Level Select should unpause, clear the active world, and show title screen.

Port tasks:

1. Rebuild pause UI in Godot.
2. Preserve copy and button behavior.
3. Ensure UI still receives input while the tree is paused.
4. Ensure player/world physics stop while paused.
5. Expose `get_state()` returning:
   - visible
   - current_level_identifier

### `src/style.css`

Current role:

- Sets page background, full-viewport game root, pixelated canvas.
- Styles title screen and pause menu with factory colors.
- Defines responsive DOM layout.

Godot equivalent:

- Project/window settings.
- Texture import settings.
- `Theme` resource for UI controls.
- `ColorRect`, `PanelContainer`, and StyleBox resources for overlays.

Color tokens to preserve:

```text
factory black: #171a1d
panel: rgba(23, 30, 30, 0.88)
panel strong: rgba(18, 23, 23, 0.96)
line: rgba(205, 225, 219, 0.28)
text: #d7e0df
muted: #9fb2ad
rust: #d48757
mint: #7edeb8
green: #22b675
```

Port tasks:

1. Create `ui_theme.tres`.
2. Create shared panel styles matching the current dark industrial UI.
3. Use anchors and containers for responsive scaling.
4. Set texture filtering/import defaults so pixel art remains crisp.

### `src/testHooks.ts`

Current role:

- Adds `window.render_game_to_text()` returning JSON with:
  - coordinate system
  - scene
  - map state
  - player state
  - camera state
  - menu state
  - pause state
  - controls metadata
- Adds `window.advanceTime(ms)` using KAPLAY debug stepping.

Godot equivalent:

- `scripts/debug_snapshot.gd`
- `scripts/test_hooks.gd`
- Optional custom web export glue.

Port tasks:

1. Implement a Godot-side `DebugSnapshot.get_snapshot_json()` that returns equivalent JSON.
2. Include stable controls metadata.
3. For web export, expose a browser callable `window.render_game_to_text()` if Playwright should keep using the same interface.
4. Replace `advanceTime(ms)` with one of:
   - a Godot test-only deterministic physics stepping helper, if feasible,
   - a test mode that runs frames normally and polls snapshots,
   - or a custom debug build hook for web tests.
5. Keep snapshot fields stable when adding door/password mechanics.

### `levels.ldtk`

Current role:

- Source of truth for levels.
- Uses embedded level data.
- Uses industrial tileset for current rendered layers.
- Has required `PlayerSpawn` entities.
- Defines an `Enemy` entity but current levels do not place one.

Godot equivalent:

- Keep LDtk as the source of truth, at least through the first Godot port.
- Import or copy into `res://data/levels.ldtk`.

Port tasks:

1. Decide whether the Godot project references the root file or keeps a copied file.
2. If copying, add a sync step so edits in LDtk do not drift.
3. Add future LDtk entity definitions for:
   - `RememberingDoor`
   - `PasswordTerminal`
   - `PasswordHint`
   - optional `Checkpoint`
4. Keep `Fg` as solid collision.
5. Keep current `Bg`, `Fg`, `Decor`, `Entities` layer names unless intentionally migrating the map schema.

### `platformerPack_industrial_tilesheet.png`

Current role:

- Only supported runtime tileset for LDtk tile layers.
- 980x560 image.
- 70 px grid.
- 14 columns x 8 rows.

Godot equivalent:

- `assets/tiles/platformerPack_industrial_tilesheet.png`
- `resources/factory_tileset.tres`

Port tasks:

1. Import as pixel art.
2. Create 70x70 TileSet atlas.
3. Add full-tile collision for solid layer use.
4. Verify each LDtk source coordinate maps to the expected atlas tile.

### `spritesheet_complete.png`

Current role:

- Supplies the current player top/bottom sprite parts.
- Current KAPLAY runtime treats it as 32 columns x 16 rows, 128 px cells.
- The LDtk tileset definition says 130 px grid, but current player rendering does not use LDtk for this image.

Godot equivalent:

- `assets/sprites/spritesheet_complete.png`
- `resources/player_sprite_frames.tres` or named `AtlasTexture` resources.

Port tasks:

1. Import as pixel art.
2. Slice player regions as 128x128.
3. Apply scale `70 / 128` if using raw 128 textures with 70 px body width.
4. Verify top/bottom alignment in-game.

### `progress.md`

Current role:

- Records project history and the next TODO: remembering door/password mechanics.

Godot equivalent:

- Keep it and update with migration status.

Port tasks:

1. Add a Godot migration section when work begins.
2. Mark Vite/KAPLAY parity tasks separately from new mechanic tasks.
3. Record decisions about LDtk import method and project folder name.

### `AGENTS.md`

Current role:

- Defines current TypeScript/KAPLAY workflow and verification instructions.

Godot equivalent:

- Update after the port direction is accepted.

Port tasks:

1. Add a Godot section with the project folder and run/export commands.
2. Preserve warnings about dirty worktrees and LDtk source-of-truth.
3. Replace KAPLAY-specific notes only after Godot becomes primary.

## Mechanics Conversion

### Input

Current controls:

```text
Move: a, d, left, right
Jump: w, up, space
Restart: r
Fullscreen: f
Pause: escape
Menu select: arrow keys
Menu start: enter
```

Godot InputMap:

```text
move_left: A, Left
move_right: D, Right
jump: W, Up, Space
restart: R
fullscreen: F
pause: Escape
ui_up/ui_down/ui_left/ui_right: built-ins or explicit arrows
ui_accept: Enter
interact: E, Enter, or another deliberate key when password/door mechanics are added
```

Implementation notes:

- Use `Input.get_axis("move_left", "move_right")`.
- Use `Input.is_action_just_pressed("jump")`.
- Keep menu and gameplay input routed so pause UI wins when visible.
- Do not let gameplay actions fire while paused.

### Player Physics

Current feel:

- Horizontal speed: `330`
- Gravity: `1600`
- Jump force: `760`
- Body size: `70x140`
- Spawn is top-left.

Godot implementation:

- `CharacterBody2D`
- `velocity.x = direction * 330`
- `velocity.y += 1600 * delta`
- jump sets `velocity.y = -760`
- `move_and_slide()`
- clamp `position.x`
- reset when `position.y > level_height + tile_size`

Risk:

- KAPLAY and Godot collision response will not feel identical by default. Tune only after baseline numbers are ported and tested.

### Player Animation

Current animation:

- Idle:
  - top `(4, 2)`
  - bottom `(4, 3)`
- Walk frames every `0.14` seconds:
  - frame 0 top/bottom `(3, 2)`, `(3, 3)`
  - frame 1 top/bottom `(3, 4)`, `(3, 5)`
- Flip both parts horizontally when facing left.

Godot implementation:

- Two `Sprite2D` nodes with atlas textures.
- Timer accumulator in `player_controller.gd`.
- Set `flip_h` on both sprites.
- Reset animation to idle whenever movement axis is `0`.

### Level Rendering

Current rendering:

- Render `Bg` first, `Fg` second, `Decor` third.
- `Bg` opacity is 0.1.
- `Fg` receives collision.
- `Decor` has no collision.

Godot implementation:

- Use separate `TileMapLayer` or `Node2D` per layer.
- Set z indexes explicitly.
- Apply opacity to `Bg`.
- Keep `Fg` as collision layer.

Risk:

- Godot tile flipping through TileMap alternatives may need a small helper. If it slows the first playable pass, render flipped cells as Sprite2D nodes and revisit TileMap purity later.

### Camera

Current behavior:

- Camera snaps to player on spawn/restart.
- X follows only when player center leaves a safe zone.
- Safe zone width = viewport width * `0.4`.
- Y follows player center immediately, clamped.
- Camera clamps to the LDtk world dimensions.

Godot implementation:

- `Camera2D` with custom script.
- Use the same math from `camera.ts`.
- Do not rely solely on Godot drag margins until parity is proven.

### Scene Flow

Current flow:

```text
no ?level= query -> title scene
?level=Level_1 -> start Level_1
title button -> set query -> start level
escape in level -> pause menu
resume -> return to gameplay
level select -> clear query -> title scene
```

Godot implementation:

- Native/editor:
  - no argument -> title
  - `--level=Level_1` -> start that level
- Web:
  - no query -> title
  - `?level=Level_1` -> start that level
- `Main.gd` owns active level switching.

### Pause

Current behavior:

- Pause menu visible means gameplay update returns early.
- KAPLAY debug pause is enabled.

Godot implementation:

- Use `get_tree().paused = true`.
- Set pause menu process mode to run while paused.
- Set player/world process mode to pause normally.
- Ensure Escape toggles:
  - closed -> open pause
  - open -> resume

### Restart And Fall Reset

Current behavior:

- `R` resets the player to spawn and zeroes velocity.
- Falling below `level.height + level.tileSize` resets the player.

Godot implementation:

- `Main.gd` or `LevelWorld.gd` exposes `reset_player()`.
- Player stores spawn position.
- Camera snaps after reset.

### Fullscreen

Current behavior:

- `F` toggles browser fullscreen.

Godot implementation:

- Toggle `DisplayServer.window_set_mode()` between fullscreen and windowed.
- For web exports, verify browser behavior because web fullscreen may have user-gesture restrictions.

### Debug/Test Snapshot

Current snapshot shape should remain conceptually identical:

```json
{
  "coordinateSystem": "world pixels, origin top-left, x right, y down",
  "scene": "Level_0",
  "map": {},
  "player": {},
  "camera": {},
  "menu": {},
  "pause": {},
  "controls": {}
}
```

Godot implementation:

- `DebugSnapshot.gd` returns a dictionary and JSON string.
- Keep field names stable.
- Add fields for new mechanics later:
  - `nearInteractable`
  - `doorMemory`
  - `passwordPrompt`
  - `knownPasswords`

## Remembering Door And Password Mechanics In Godot

Do this after the Godot port reaches movement/rendering/UI parity. The mechanic should be minimal, readable, deterministic, and testable.

### LDtk Schema

Add entity definitions:

```text
RememberingDoor
  door_id: String
  required_password: String
  starts_open: Bool
  remembers_failed_attempts: Bool

PasswordTerminal
  terminal_id: String
  password_text: String
  door_id: String

PasswordHint
  hint_id: String
  hint_text: String
  door_id: String
```

Optional later entities:

```text
MemoryResetSwitch
Checkpoint
Enemy
```

### Runtime Nodes

Suggested scenes:

```text
RememberingDoor (StaticBody2D or Node2D)
  Sprite2D
  CollisionShape2D
  InteractionArea (Area2D)

PasswordTerminal (Area2D)
  Sprite2D
  InteractionArea/CollisionShape2D

PasswordPrompt (Control)
  Panel
  Label
  LineEdit
  SubmitButton
```

### Door Memory State

Autoload:

```text
DoorMemory.gd
```

Data model:

```text
level_id -> door_id -> {
  opened: bool,
  attempts: Array[String],
  last_attempt: String,
  remembers_failed_attempts: bool
}
```

First implementation:

- Session memory only.
- Door memory survives restart and level-select transitions.
- Door memory resets on full app reload.

Later implementation:

- Persist to `user://save.json` if the jam design wants the door to remember across play sessions.

### Interaction Loop

1. Player approaches terminal or door.
2. UI prompt appears.
3. Press `interact`.
4. Terminal reveals or records a password.
5. Door opens if submitted password matches `required_password`.
6. Door records failed attempts if configured.
7. Returning to the door shows feedback based on remembered history.

Suggested feedback:

```text
No attempt yet: "The door waits."
Wrong attempt remembered: "The door remembers that word."
Correct password: "The door remembers you."
Already open: "The door is still open."
```

Debug snapshot additions:

```json
{
  "interaction": {
    "near": "RememberingDoor",
    "promptVisible": true
  },
  "doorMemory": {
    "Level_1/main": {
      "opened": false,
      "lastAttempt": "ASH",
      "attemptCount": 1
    }
  }
}
```

## Migration Phases

### Phase 0: Project Decision

Goal:

- Decide where the Godot project lives and protect current work.

Tasks:

1. Confirm whether to reuse `new-game-project/` or rename/create `godot/`.
2. Add `.godot/` cache files to the right `.gitignore`.
3. Copy current root assets into the Godot project or decide on a sync approach.
4. Keep the TypeScript version runnable during the port.

Acceptance criteria:

- Godot project opens.
- Main scene exists.
- No unrelated TypeScript files are changed.

### Phase 1: Asset Import

Goal:

- Get pixel art into Godot cleanly.

Tasks:

1. Import industrial tilesheet.
2. Create 70x70 TileSet.
3. Import complete spritesheet.
4. Create player atlas frame resources.
5. Configure nearest filtering.

Acceptance criteria:

- A test scene can display a few factory tiles and the composed player sprite without blur.

### Phase 2: LDtk Loader

Goal:

- Parse current `levels.ldtk` in Godot.

Tasks:

1. Implement `ldtk_loader.gd`.
2. Implement required layer/entity validation.
3. Build `LevelData` dictionaries/resources.
4. Expose list of levels.

Acceptance criteria:

- Debug output lists all four levels with correct dimensions, layer counts, and spawn points.

### Phase 3: Level Rendering And Collision

Goal:

- Render all existing LDtk levels in Godot.

Tasks:

1. Create `LevelWorld`.
2. Render `Bg`, `Fg`, and `Decor`.
3. Add `Fg` collision.
4. Preserve opacity and z order.
5. Confirm each level's bounds use `pxWid`/`pxHei`.

Acceptance criteria:

- Each level can be loaded by ID.
- Canvas shows the industrial level tiles.
- Solid tiles block a simple test body.

### Phase 4: Player Parity

Goal:

- Make the current platformer playable.

Tasks:

1. Create CharacterBody2D player.
2. Implement movement, jump, gravity, reset, and fall reset.
3. Recreate animation.
4. Clamp player horizontally.

Acceptance criteria:

- Player can move, jump, land, restart, and cannot leave level bounds.

### Phase 5: Camera Parity

Goal:

- Match current camera behavior.

Tasks:

1. Add Camera2D.
2. Implement snap and safe-zone follow.
3. Clamp to level bounds.
4. Snap after restart.

Acceptance criteria:

- Camera follows like the KAPLAY version and does not show outside the level.

### Phase 6: UI And Screen Flow

Goal:

- Recreate title and pause flows.

Tasks:

1. Build title screen.
2. Build pause menu.
3. Implement level selection.
4. Implement direct level start.
5. Implement fullscreen.

Acceptance criteria:

- Title renders.
- Every listed level can be selected.
- Escape pauses and freezes gameplay.
- Resume and Level Select work.

### Phase 7: Debug/Test Hooks

Goal:

- Preserve testability.

Tasks:

1. Implement `DebugSnapshot`.
2. Return JSON equivalent to current `window.render_game_to_text()`.
3. Add web hook if browser smoke tests are needed.
4. Add Godot-native smoke test notes.

Acceptance criteria:

- A human or automated test can inspect scene, level, player, camera, menu, and pause state.

### Phase 8: Remembering Door And Password

Goal:

- Build the next gameplay loop in Godot.

Tasks:

1. Add LDtk door/terminal/hint entity definitions.
2. Parse those entities in Godot.
3. Spawn interactable scenes.
4. Add `interact` input.
5. Add password prompt UI.
6. Add `DoorMemory` autoload.
7. Add door collision open/close state.
8. Extend debug snapshot.

Acceptance criteria:

- Player can reach a door.
- Player can learn or enter a password.
- Door reacts deterministically.
- Door remembers relevant state across restart/level select.
- Mechanic state appears in debug snapshot.

### Phase 9: Export And Retirement

Goal:

- Decide whether Godot fully replaces Vite/KAPLAY.

Tasks:

1. Add web export preset.
2. Test local exported build.
3. Test deployment path.
4. Update `AGENTS.md`.
5. Update `progress.md`.
6. Remove or archive TypeScript source only after parity and deployment work.

Acceptance criteria:

- Godot build/export works.
- The old prototype is no longer needed or is intentionally kept as reference.

## Verification Checklist

Run this before considering the port complete:

1. Project opens in Godot without import errors.
2. Main scene runs.
3. Title screen renders.
4. Title lists `Level_0`, `Level_1`, `Level_2`, and `Level_3`.
5. Each level starts from title.
6. Direct level start works.
7. `Bg`, `Fg`, and `Decor` render.
8. `Fg` collision works.
9. Player starts at the LDtk spawn point.
10. Player can move left/right.
11. Player can jump and land.
12. Player cannot leave the level horizontally.
13. Player resets on `R`.
14. Player resets after falling below the level.
15. Camera follows and clamps.
16. Escape opens pause.
17. Pause freezes gameplay.
18. Resume works.
19. Level Select from pause works.
20. Fullscreen toggle works.
21. Debug snapshot returns valid JSON.
22. Door/password loop can be reached from normal play.
23. Door memory behavior is visible in-game and in debug snapshot.

## Main Risks

1. Physics feel drift: Godot `CharacterBody2D` will not exactly match KAPLAY without tuning.
2. Origin mismatch: current LDtk spawns are top-left body positions, while Godot nodes are often authored center-origin.
3. Level size mismatch: current LDtk `pxWid`/`pxHei` are not always `columns * tile_size`.
4. Tile flip handling: Godot TileMap alternatives may need explicit transform support.
5. Pixel art blur: import filtering and stretch settings must be checked.
6. Pause behavior: Godot tree pause can also pause UI unless process modes are configured.
7. Web query behavior: Godot web export will need custom handling to preserve `?level=...`.
8. Test hook parity: browser `window` hooks do not automatically exist in Godot.
9. Existing Godot stub: `new-game-project/` is untracked and contains `.godot` cache output; decide what should be versioned before adding real work there.
10. Sprite grid mismatch: `spritesheet_complete.png` should follow the current runtime's 128 px grid for player sprites, not the LDtk tileset definition's 130 px grid, unless the art is reauthored.

## Recommended First Implementation Slice

Start with a small vertical slice:

1. Reuse or rename the existing Godot project.
2. Import assets with nearest filtering.
3. Create `Main`, `LevelCatalog`, `LdtkLoader`, and `LevelWorld`.
4. Load only `Level_0`.
5. Render `Bg`, `Fg`, `Decor`.
6. Spawn the player at `PlayerSpawn`.
7. Implement movement, jump, collision, and camera.
8. Add title/pause after the level is playable.
9. Add the debug snapshot once the state objects exist.
10. Only then add remembering door/password entities.

This order keeps the port honest: it proves the map pipeline, physics body, and camera before spending time on UI polish or new mechanics.
