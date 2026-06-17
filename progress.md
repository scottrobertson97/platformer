Original prompt: gamejam platformer with theme "ashen factory", wildcard "a door that remembers", ingredient "a password"; use KAPLAY.js and TypeScript; tilesheet exists in the root dir; get started with a basic controllable platformer and map editing from the tilesheet. User later changed map workflow to inline text maps, then to LDtk-authored external levels rendered directly from `Tiles` layers.

## Progress

- Started a Vite + TypeScript + KAPLAY scaffold.
- Chosen map workflow: root `levels.ldtk` project JSON with external `.ldtkl` level files in `levels/`.
- Implemented the first KAPLAY scene with atlas slicing, player physics, camera follow, restart, fullscreen, and Playwright-facing test hooks.
- Playtesting found that holding left could send the player past the map edge before reset; clamped horizontal position and lowered the fall reset threshold to one tile below the map.
- Verified `npm run build`, in-app browser rendering, and scripted Playwright runs for left movement, right movement, jump, landing, collision, and camera follow.
- Added an LDtk adapter that exposes named `Tiles` layers and a `PlayerSpawn` entity to the KAPLAY runtime without inline text maps.

## TODO

- Next gameplay pass: implement "a door that remembers" and password interaction mechanics.
