// Collision Batcher - Merges adjacent ground/sand tiles into larger collision rectangles
// Reduces thousands of physics bodies to dozens, dramatically improving performance
// Also merges water tiles into regions for efficient water physics checks

export class CollisionBatcher {
  constructor(k) {
    this.k = k;
    this.tileSize = 64;
  }

  // Find and create batched collision objects for a level
  createBatchedCollisions(levelData, tileSize = 64) {
    this.tileSize = tileSize;
    const k = this.k;

    // Batch ground ('=') and sand ('s') tiles — both need static physics bodies
    const groundRegions = this.findCollisionRegions(levelData, '=');
    const sandRegions = this.findCollisionRegions(levelData, 's');

    console.log(`CollisionBatcher: Found ${groundRegions.length} ground + ${sandRegions.length} sand collision regions`);

    const collisionObjects = [];

    // Create collision objects for ground regions
    for (const region of groundRegions) {
      collisionObjects.push(this._createRegionBody(k, region, tileSize, "ground"));
    }

    // Create collision objects for sand regions
    for (const region of sandRegions) {
      collisionObjects.push(this._createRegionBody(k, region, tileSize, "sand"));
    }

    console.log(`CollisionBatcher: Created ${collisionObjects.length} batched collision objects`);
    return collisionObjects;
  }

  // Create a single collision body for a merged region
  // Position must match how addLevel places tiles with anchor("bot"):
  // each tile's bottom-center is at (col * tileSize, row * tileSize),
  // so the tile fills x: [col*ts - ts/2, col*ts + ts/2], y: [row*ts - ts, row*ts]
  _createRegionBody(k, region, tileSize, tag) {
    const startY = region.y - region.height;
    return k.add([
      k.pos(region.x * tileSize - tileSize / 2, startY * tileSize - tileSize),
      k.area({
        shape: new k.Rect(k.vec2(0, 0), region.width * tileSize, region.height * tileSize)
      }),
      k.body({ isStatic: true }),
      tag,
      "batchedCollision",
      {
        regionWidth: region.width,
        regionHeight: region.height
      }
    ]);
  }

  // Compute per-tile water areas from level data (no game objects needed).
  // Returns one {x, y, width, height} per water tile, matching exactly what
  // addLevel would produce: pos at (col*ts, row*ts), width/height = tileSize.
  // We intentionally do NOT merge water tiles — the per-tile gaps in the
  // detection check are essential for the water escape mechanic.
  computeWaterRegions(levelData, tileSize = 64) {
    const areas = [];
    for (let row = 0; row < levelData.length; row++) {
      const rowStr = levelData[row];
      for (let col = 0; col < rowStr.length; col++) {
        if (rowStr[col] === 'w') {
          areas.push({
            x: col * tileSize,
            y: row * tileSize,
            width: tileSize,
            height: tileSize,
          });
        }
      }
    }
    return areas;
  }

  // Find rectangular regions of a given tile char using greedy meshing
  findCollisionRegions(levelData, tileChar) {
    const regions = [];
    const visited = new Set();

    for (let y = 0; y < levelData.length; y++) {
      const row = levelData[y];
      for (let x = 0; x < row.length; x++) {
        if (row[x] !== tileChar || visited.has(`${x},${y}`)) {
          continue;
        }

        const region = this._findLargestRect(levelData, x, y, tileChar, visited);
        if (region) {
          regions.push(region);
        }
      }
    }

    return regions;
  }

  // Greedy algorithm to find largest rectangle of a given tile char
  _findLargestRect(levelData, startX, startY, tileChar, visited) {
    // First, find max width on the starting row
    let maxWidth = 0;
    for (let x = startX; x < levelData[startY].length; x++) {
      if (levelData[startY][x] === tileChar && !visited.has(`${x},${startY}`)) {
        maxWidth++;
      } else {
        break;
      }
    }

    if (maxWidth === 0) return null;

    // Now try to extend downward, tracking minimum width
    let height = 1;
    let width = maxWidth;

    for (let y = startY + 1; y < levelData.length; y++) {
      let rowWidth = 0;
      for (let x = startX; x < startX + width; x++) {
        if (x < levelData[y].length && levelData[y][x] === tileChar && !visited.has(`${x},${y}`)) {
          rowWidth++;
        } else {
          break;
        }
      }

      if (rowWidth === 0) {
        break;
      }

      width = Math.min(width, rowWidth);
      height++;
    }

    // Mark all tiles in this region as visited
    for (let y = startY; y < startY + height; y++) {
      for (let x = startX; x < startX + width; x++) {
        visited.add(`${x},${y}`);
      }
    }

    return {
      x: startX,
      y: startY + height, // Bottom of region
      width: width,
      height: height
    };
  }

  // Get stats for debugging
  getStats(levelData) {
    let totalGroundTiles = 0;
    let totalSandTiles = 0;
    let totalWaterTiles = 0;
    for (const row of levelData) {
      for (const char of row) {
        if (char === '=') totalGroundTiles++;
        else if (char === 's') totalSandTiles++;
        else if (char === 'w') totalWaterTiles++;
      }
    }

    const groundRegions = this.findCollisionRegions(levelData, '=');
    const sandRegions = this.findCollisionRegions(levelData, 's');
    const waterRegions = this.findCollisionRegions(levelData, 'w');
    const totalTiles = totalGroundTiles + totalSandTiles;
    const totalRegions = groundRegions.length + sandRegions.length;

    return {
      totalGroundTiles,
      totalSandTiles,
      totalWaterTiles,
      batchedRegions: totalRegions,
      waterRegions: waterRegions.length,
      reductionRatio: totalTiles > 0 ? ((totalTiles - totalRegions) / totalTiles * 100).toFixed(1) + '%' : '0%'
    };
  }
}

// Factory function
export function createCollisionBatcher(k) {
  return new CollisionBatcher(k);
}
