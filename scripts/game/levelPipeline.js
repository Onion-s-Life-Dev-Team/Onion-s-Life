// levelPipeline.js
// Consolidated level-compilation pipeline for normal level loads.
//
// Single pass over level data to produce:
//   - a grid lookup + onDraw() ground renderer (O(visible) drawing)
//   - merged collision bodies (greedy meshing via shared levelMatrixUtils)
//   - computed water regions (for position-based water physics)
//   - bubble tiles injected into the level data
//
// The renderer and collision builder share ONE greedy-mesh utility instead of
// maintaining separate scan loops.

import { findGreedyRectangles, computeWaterRegions, createBubbles } from './levelMatrixUtils.js';

// Ground/sand tiles participate in both rendering and static collision.
const COLLIDABLE = { '=': 'ground', s: 'sand' };

// Build a BatchedGroundRenderer-style onDraw() hook straight from level data.
// Returns { register, draw } exposed via the returned renderer object.
function createGroundRenderer(k) {
  let tileGrid = new Map();
  let tileSize = 64;
  let enabled = true;

  const renderer = {
    registerGroundTiles(levelData, ts = 64) {
      tileGrid = new Map();
      tileSize = ts;
      const sprites = { '=': 'grass', s: 'sand', w: 'water' };
      for (let row = 0; row < levelData.length; row++) {
        const rowStr = levelData[row];
        for (let col = 0; col < rowStr.length; col++) {
          const sprite = sprites[rowStr[col]];
          if (sprite) tileGrid.set(`${col},${row}`, sprite);
        }
      }
      return renderer;
    },
    setupRenderer() {
      k.onDraw(() => {
        if (!enabled || tileGrid.size === 0) return;
        const cam = k.camPos();
        const screenW = k.width();
        const screenH = k.height();
        const minX = Math.floor((cam.x - screenW / 2 - tileSize) / tileSize);
        const maxX = Math.ceil((cam.x + screenW / 2 + tileSize) / tileSize);
        const minY = Math.floor((cam.y - screenH / 2 - tileSize) / tileSize);
        const maxY = Math.ceil((cam.y + screenH / 2 + tileSize) / tileSize);
        let drawn = 0;
        for (let gy = minY; gy <= maxY; gy++) {
          for (let gx = minX; gx <= maxX; gx++) {
            const sprite = tileGrid.get(`${gx},${gy}`);
            if (sprite) {
              k.drawSprite({
                sprite,
                pos: k.vec2(gx * tileSize, gy * tileSize),
                anchor: 'bot',
                opacity: sprite === 'water' ? 0.8 : 1,
              });
              drawn++;
            }
          }
        }
        if (window.gameConfig && window.gameConfig.debug) {
          k.drawText({
            text: `BatchedRenderer\nTiles: ${drawn}/${tileGrid.size}\nGrid: ${maxX - minX}x${maxY - minY}`,
            pos: k.vec2(cam.x - screenW / 2 + 10, cam.y - screenH / 2 + 10),
            size: 16,
            color: k.rgb(255, 255, 0),
          });
        }
      });
      return renderer;
    },
    setEnabled(e) { enabled = e; return renderer; },
    clear() { tileGrid.clear(); return renderer; },
    getStats() { return { totalTiles: tileGrid.size, enabled }; },
  };
  return renderer;
}

// Build merged static collision bodies from level data via greedy meshing.
function createCollisionBodies(k, levelData, tileSize) {
  const bodies = [];
  for (const [ch, tag] of Object.entries(COLLIDABLE)) {
    for (const region of findGreedyRectangles(levelData, ch)) {
      const startY = region.y - region.height;
      bodies.push([
        k.pos(region.x * tileSize - tileSize / 2, startY * tileSize - tileSize),
        k.area({ shape: new k.Rect(k.vec2(0, 0), region.width * tileSize, region.height * tileSize) }),
        k.body({ isStatic: true }),
        tag,
        'batchedCollision',
        { regionWidth: region.width, regionHeight: region.height },
      ]);
    }
  }
  return bodies;
}

// Single entry point for loading a level with batched rendering.
// Returns the pieces game-main previously assembled manually.
export function compileLevel(k, levelData, tileSize = 64, opts = {}) {
  const render = opts.render !== false;
  const groundRenderer = render ? createGroundRenderer(k).registerGroundTiles(levelData, tileSize).setupRenderer() : null;
  const collisionObjects = createCollisionBodies(k, levelData, tileSize);
  if (opts.addCollisions !== false) {
    for (const components of collisionObjects) k.add(components);
  }
  const waterRegions = computeWaterRegions(levelData, tileSize);
  return { groundRenderer, collisionObjects, waterRegions };
}

export { computeWaterRegions, createBubbles };
