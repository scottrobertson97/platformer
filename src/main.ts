import kaplay, { type CompList, type GameObj, type SpriteAtlasData } from "kaplay";
import "./style.css";
import tilesheetUrl from "../platformerPack_industrial_tilesheet.png?url";
import {
  BACKGROUND_MAP,
  DECOR_MAP,
  LEVEL_HEIGHT,
  LEVEL_WIDTH,
  SOLID_MAP,
  TILE_SIZE,
  findTile,
  stripTile,
} from "./level";

const VIEW_WIDTH = 960;
const VIEW_HEIGHT = 540;
const GRAVITY = 1600;
const PLAYER_SPEED = 330;
const PLAYER_JUMP_FORCE = 760;
const PLAYER_WIDTH = 42;
const PLAYER_HEIGHT = 58;
const ATLAS_COLUMNS = 14;
const ATLAS_ROWS = 8;

const spawnTile = findTile(SOLID_MAP, "@");
const solidMap = stripTile(SOLID_MAP, "@");
const worldWidth = LEVEL_WIDTH * TILE_SIZE;
const worldHeight = LEVEL_HEIGHT * TILE_SIZE;

const root = document.querySelector<HTMLElement>("#game");

if (!root) {
  throw new Error("Missing #game root element");
}

const k = kaplay({
  root,
  width: VIEW_WIDTH,
  height: VIEW_HEIGHT,
  letterbox: true,
  crisp: true,
  global: false,
  background: [22, 26, 28],
});

k.loadSpriteAtlas(tilesheetUrl, makeTilesheetAtlas());
k.setGravity(GRAVITY);

let player: GameObj | null = null;

k.scene("factory", () => {
  const spawnPoint = k.vec2(
    spawnTile.x * TILE_SIZE + (TILE_SIZE - PLAYER_WIDTH) / 2,
    spawnTile.y * TILE_SIZE + TILE_SIZE - PLAYER_HEIGHT,
  );

  k.setBackground(k.rgb(22, 26, 28));
  addBackground();
  addSolids();
  addDecor();

  player = k.add([
    k.pos(spawnPoint),
    k.rect(PLAYER_WIDTH, PLAYER_HEIGHT, { radius: 4 }),
    k.color(89, 222, 170),
    k.outline(3, k.rgb(18, 37, 36)),
    k.area(),
    k.body({ jumpForce: PLAYER_JUMP_FORCE }),
    "player",
  ]);

  const resetPlayer = () => {
    if (!player) {
      return;
    }

    player.pos = spawnPoint.clone();
    player.vel = k.vec2(0, 0);
  };

  k.onKeyPress(["space", "w", "up"], () => {
    if (player?.isGrounded()) {
      player.jump();
    }
  });

  k.onKeyPress("r", resetPlayer);

  k.onKeyPress("f", () => {
    k.setFullscreen(!k.isFullscreen());
  });

  k.onUpdate(() => {
    if (!player) {
      return;
    }

    const horizontal =
      Number(k.isKeyDown(["d", "right"])) - Number(k.isKeyDown(["a", "left"]));

    player.move(horizontal * PLAYER_SPEED, 0);
    player.pos.x = k.clamp(player.pos.x, 0, worldWidth - PLAYER_WIDTH);

    if (player.pos.y > worldHeight + TILE_SIZE) {
      resetPlayer();
    }

    followPlayerCamera(player);
  });
});

k.go("factory");

window.render_game_to_text = () => {
  const playerState = player
    ? {
        x: round(player.pos.x),
        y: round(player.pos.y),
        vx: round(player.vel?.x ?? 0),
        vy: round(player.vel?.y ?? 0),
        grounded: Boolean(player.isGrounded?.()),
      }
    : null;

  return JSON.stringify({
    coordinateSystem: "world pixels, origin top-left, x right, y down",
    scene: k.getSceneName(),
    map: {
      tileSize: TILE_SIZE,
      columns: LEVEL_WIDTH,
      rows: LEVEL_HEIGHT,
      width: worldWidth,
      height: worldHeight,
    },
    player: playerState,
    controls: {
      move: ["a", "d", "left", "right"],
      jump: ["w", "up", "space"],
      restart: "r",
      fullscreen: "f",
    },
  });
};

window.advanceTime = (ms: number) => {
  const frameCount = Math.max(1, Math.round(ms / (1000 / 60)));

  for (let i = 0; i < frameCount; i += 1) {
    k.debug.stepFrame();
  }
};

function makeTilesheetAtlas(): SpriteAtlasData {
  const atlas: SpriteAtlasData = {};

  for (let row = 0; row < ATLAS_ROWS; row += 1) {
    for (let column = 0; column < ATLAS_COLUMNS; column += 1) {
      const id = row * ATLAS_COLUMNS + column;

      atlas[`tile-${id}`] = {
        x: column * TILE_SIZE,
        y: row * TILE_SIZE,
        width: TILE_SIZE,
        height: TILE_SIZE,
      };
    }
  }

  return atlas;
}

function addBackground() {
  k.addLevel(BACKGROUND_MAP, {
    tileWidth: TILE_SIZE,
    tileHeight: TILE_SIZE,
    tiles: {
      ".": () => [k.sprite("tile-28"), k.opacity(0.36), k.z(-20)],
    },
  });
}

function addSolids() {
  k.addLevel(solidMap, {
    tileWidth: TILE_SIZE,
    tileHeight: TILE_SIZE,
    tiles: {
      "#": () => [
        k.sprite("tile-28"),
        k.area(),
        k.body({ isStatic: true }),
        k.z(0),
        "solid",
      ],
    },
  });
}

function addDecor() {
  k.addLevel(DECOR_MAP, {
    tileWidth: TILE_SIZE,
    tileHeight: TILE_SIZE,
    tiles: {
      D: () => decorTile("tile-69", ["door", "remembering-door"]),
      P: () => decorTile("tile-74", ["password"]),
      h: () => decorTile("tile-51", ["hazard-sign"]),
      p: () => decorTile("tile-61", ["pipe"]),
      r: () => decorTile("tile-83", ["route-marker"]),
      s: () => decorTile("tile-37", ["spikes"]),
      v: () => decorTile("tile-71", ["valve"]),
    },
  });
}

function decorTile(spriteName: string, tags: string[]): CompList<unknown> {
  return [k.sprite(spriteName), k.z(10), ...tags];
}

function followPlayerCamera(target: GameObj) {
  const desiredX = target.pos.x + PLAYER_WIDTH / 2;
  const desiredY = target.pos.y + PLAYER_HEIGHT / 2;

  k.setCamPos(
    clampCameraAxis(desiredX, k.width(), worldWidth),
    clampCameraAxis(desiredY, k.height(), worldHeight),
  );
}

function clampCameraAxis(target: number, viewportSize: number, worldSize: number) {
  if (worldSize <= viewportSize) {
    return worldSize / 2;
  }

  return k.clamp(target, viewportSize / 2, worldSize - viewportSize / 2);
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
