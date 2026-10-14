// A lightweight world-space cloud backdrop for gameplay scenes.
// Clouds drift to the right independently of camera movement and are drawn
// before the level pipeline's onDraw renderer, so level art is always in front.

const TILE_MULTIPLIER = 4; // tile size in viewports; must exceed the viewport to avoid visible seams
// Half the cloud sprite size (sprite is 222x104) at scale 1.
const CLOUD_HALF_W = 111;
const CLOUD_HALF_H = 52;
const GRID_COLS = 16;
const GRID_ROWS = 12;
const CLOUD_SEED = 1337;
const JITTER = 0.8;

// Positive modulo: result is always in [0, extent).
function mod(value, extent) {
  return ((value % extent) + extent) % extent;
}

// Signed offset to the nearest repeat of a tiled value, in [-extent/2, extent/2).
function wrapNear(value, extent) {
  return mod(value + extent / 2, extent) - extent / 2;
}

// Small deterministic PRNG (mulberry32): the same seed gives the same layout.
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// One jittered point per grid cell, kept inside its cell.
function jitteredGrid(tileW, tileH, cols, rows, seed, jitter) {
  const rand = mulberry32(seed);
  const cellW = tileW / cols;
  const cellH = tileH / rows;
  const points = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      points.push([
        (c + 0.5) * cellW + (rand() - 0.5) * cellW * jitter,
        (r + 0.5) * cellH + (rand() - 0.5) * cellH * jitter,
      ]);
    }
  }
  return points;
}

export function setupCloudBackground(k) {
  // Tile dimensions are captured once so the layout stays consistent.
  const tileWidth = k.width() * TILE_MULTIPLIER;
  const tileHeight = k.height() * TILE_MULTIPLIER;
  const startCamera = k.getCamPos();
  const originX = startCamera.x - tileWidth / 2;
  const originY = startCamera.y - tileHeight / 2;

  const clouds = jitteredGrid(tileWidth, tileHeight, GRID_COLS, GRID_ROWS, CLOUD_SEED, JITTER).map(([x, y]) => ({
    x,
    y,
    scale: k.rand(0.45, 0.8),
    opacity: k.rand(0.55, 0.85),
    speed: k.rand(12, 28),
  }));

  // Register before the level pipeline's onDraw callback. KAPLAY runs global
  // onDraw listeners before scene objects; the ground's later callback then
  // paints over the clouds, as do regular level objects.
  k.onDraw(() => {
    const dt = k.dt();
    const camera = k.getCamPos();
    const halfW = k.width() / 2;
    const halfH = k.height() / 2;

    for (const cloud of clouds) {
      cloud.x = mod(cloud.x + cloud.speed * dt, tileWidth);

      // Nearest repeated copy of this cloud relative to the camera. The viewport
      // is narrower than the tile, so at most one copy per axis can be on screen.
      const dx = wrapNear(originX + cloud.x - camera.x, tileWidth);
      const dy = wrapNear(originY + cloud.y - camera.y, tileHeight);
      if (Math.abs(dx) > halfW + CLOUD_HALF_W * cloud.scale
        || Math.abs(dy) > halfH + CLOUD_HALF_H * cloud.scale) continue;

      k.drawSprite({
        sprite: "cloud",
        pos: k.vec2(camera.x + dx, camera.y + dy),
        scale: k.vec2(cloud.scale),
        opacity: cloud.opacity,
        anchor: "center",
      });
    }
  });
}
