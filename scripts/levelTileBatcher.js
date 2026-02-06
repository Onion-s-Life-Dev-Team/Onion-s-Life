// Advanced tile batching system for massive performance improvements
// This batches both horizontal and vertical runs of tiles into single draw calls

export class LevelTileBatcher {
  constructor(k, tileSize = 64) {
    this.k = k;
    this.tileSize = tileSize;
    this.tileBatches = new Map();
    this.debugMode = false;
  }

  // Main function to batch an entire level
  batchLevel(levelData, levelConf) {
    const batches = this.findTileBatches(levelData);
    const optimizedTiles = [];
    
    // Track which tiles have been batched
    const batchedTiles = new Set();
    
    // Process each batch type
    for (const [tileType, regions] of batches.entries()) {
      for (const region of regions) {
        // Create a single object for the entire region
        const batchObj = this.createBatchedTile(tileType, region, levelConf);
        if (batchObj) {
          optimizedTiles.push(batchObj);
          
          // Mark tiles as batched
          for (let y = region.startY; y <= region.endY; y++) {
            for (let x = region.startX; x <= region.endX; x++) {
              batchedTiles.add(`${x},${y}`);
            }
          }
        }
      }
    }
    
    // Add any remaining unbatched tiles
    for (let y = 0; y < levelData.length; y++) {
      for (let x = 0; x < levelData[y].length; x++) {
        const tile = levelData[y][x];
        if (tile && tile !== ' ' && !batchedTiles.has(`${x},${y}`) && levelConf.tiles[tile]) {
          const tileObj = levelConf.tiles[tile]();
          if (tileObj) {
            // Filter out offscreen component - keep anchor("bot") from original tiles
            // Smart culling in generalOptimizations.js handles visibility instead
            const filtered = tileObj.filter(comp => !(comp && comp.id === "offscreen"));
            // Add pos at beginning - match addLevel positioning (row * tileSize)
            filtered.unshift(this.k.pos(x * this.tileSize, y * this.tileSize));
            optimizedTiles.push(filtered);
          }
        }
      }
    }
    
    return optimizedTiles;
  }

  // Find rectangular regions of the same tile type
  findTileBatches(levelData) {
    const batches = new Map();
    const visited = new Set();
    
    for (let y = 0; y < levelData.length; y++) {
      for (let x = 0; x < levelData[y].length; x++) {
        const tile = levelData[y][x];
        
        // Skip if already visited or not a batchable tile
        if (visited.has(`${x},${y}`) || !this.isBatchableTile(tile)) {
          continue;
        }
        
        // Find the largest rectangle starting from this position
        const region = this.findLargestRectangle(levelData, x, y, tile, visited);
        
        if (region.width * region.height > 1) {
          if (!batches.has(tile)) {
            batches.set(tile, []);
          }
          batches.get(tile).push(region);
        }
      }
    }
    
    return batches;
  }

  // Find the largest rectangle of the same tile type
  findLargestRectangle(levelData, startX, startY, tileType, visited) {
    let bestArea = 0;
    let bestRegion = null;
    
    // Try different rectangle sizes
    for (let endY = startY; endY < levelData.length; endY++) {
      let minWidth = Infinity;
      
      // Check each row
      for (let y = startY; y <= endY; y++) {
        let width = 0;
        
        // Count consecutive tiles of the same type
        for (let x = startX; x < levelData[y].length; x++) {
          if (levelData[y][x] === tileType && !visited.has(`${x},${y}`)) {
            width++;
          } else {
            break;
          }
        }
        
        minWidth = Math.min(minWidth, width);
        if (minWidth === 0) break;
      }
      
      // Calculate area and update best if larger
      const height = endY - startY + 1;
      const area = minWidth * height;
      
      if (area > bestArea) {
        bestArea = area;
        bestRegion = {
          startX,
          startY,
          endX: startX + minWidth - 1,
          endY,
          width: minWidth,
          height
        };
      }
    }
    
    // Mark the best region as visited
    if (bestRegion) {
      for (let y = bestRegion.startY; y <= bestRegion.endY; y++) {
        for (let x = bestRegion.startX; x <= bestRegion.endX; x++) {
          visited.add(`${x},${y}`);
        }
      }
    }
    
    return bestRegion || { startX, startY, endX: startX, endY: startY, width: 1, height: 1 };
  }

  // Check if a tile type should be batched
  isBatchableTile(tile) {
    // Batch solid tiles like walls, ground, etc.
    const batchableTiles = ['=', 'i', '#', '_', '+', '~', 'w', 's'];
    return batchableTiles.includes(tile);
  }

  // Create a batched tile object
  createBatchedTile(tileType, region, levelConf) {
    // Get the tile configuration
    const tileConfig = levelConf.tiles[tileType];
    if (!tileConfig) return null;
    
    const width = region.width * this.tileSize;
    const height = region.height * this.tileSize;
    const x = region.startX * this.tileSize;
    const y = region.startY * this.tileSize;
    
    // Special handling for wall tiles
    if (tileType === '=') {
      return this.createBatchedWall(x, y, width, height);
    }
    
    // Generic batched tile
    return this.createGenericBatchedTile(tileType, x, y, width, height, tileConfig);
  }

  // Create a batched wall with proper collision and rendering
  createBatchedWall(x, y, width, height) {
    const k = this.k;
    const tileSize = this.tileSize;

    const components = [
      k.pos(x + width/2 - tileSize/2, y + height - tileSize),
      k.anchor("bot"),
      k.area({ shape: new k.Rect(k.vec2(-width/2, -height), width, height) }),
      k.body({ isStatic: true }),
      // Note: offscreen removed due to Kaplay v4000 compatibility - using smart culling instead
      "ground",
      {
        width,
        height,
        draw() {
          // Use tiled rendering for better performance
          // Draw offset from anchor point (bottom-center) to top-left of region
          k.drawSprite({
            sprite: "grass",
            pos: k.vec2(-width/2, -height),
            width: width,
            height: height,
            tiled: true,
            anchor: "topleft"
          });

          // Debug mode - show batch boundaries
          if (this.debugMode) {
            k.drawRect({
              pos: k.vec2(-width/2, -height),
              width: width,
              height: height,
              color: k.rgb(255, 0, 0),
              fill: false,
              outline: { color: k.rgb(255, 0, 0), width: 2 }
            });
          }
        }
      }
    ];
    
    return components;
  }

  // Create a generic batched tile
  createGenericBatchedTile(tileType, x, y, width, height, tileConfig) {
    const k = this.k;
    const tileSize = this.tileSize;
    const baseComponents = tileConfig();

    // Find the sprite component
    let spriteName = null;
    for (const comp of baseComponents) {
      if (comp && comp.id === "sprite") {
        spriteName = comp.sprite;
        break;
      }
    }

    if (!spriteName) return null;

    const components = [
      k.pos(x + width/2 - tileSize/2, y + height - tileSize),
      k.anchor("bot"),
      k.area({ shape: new k.Rect(k.vec2(-width/2, -height), width, height) }),
      // Note: offscreen removed due to Kaplay v4000 compatibility - using smart culling instead
      {
        width,
        height,
        draw() {
          k.drawSprite({
            sprite: spriteName,
            pos: k.vec2(-width/2, -height),
            width: width,
            height: height,
            tiled: true,
            anchor: "topleft"
          });
        }
      }
    ];
    
    // Add other components from the original tile config
    for (const comp of baseComponents) {
      if (comp && comp.id !== "sprite" && comp.id !== "pos" && comp.id !== "area") {
        components.push(comp);
      }
    }
    
    return components;
  }

  // Enable/disable debug visualization
  setDebugMode(enabled) {
    this.debugMode = enabled;
  }

  // Get statistics about the batching
  getBatchingStats(levelData) {
    const batches = this.findTileBatches(levelData);
    let totalTiles = 0;
    let batchedTiles = 0;
    let batchCount = 0;
    
    // Count original tiles
    for (let y = 0; y < levelData.length; y++) {
      for (let x = 0; x < levelData[y].length; x++) {
        if (this.isBatchableTile(levelData[y][x])) {
          totalTiles++;
        }
      }
    }
    
    // Count batched tiles
    for (const [tileType, regions] of batches.entries()) {
      batchCount += regions.length;
      for (const region of regions) {
        batchedTiles += region.width * region.height;
      }
    }
    
    return {
      totalTiles,
      batchedTiles,
      unbatchedTiles: totalTiles - batchedTiles,
      batchCount,
      reductionRatio: totalTiles > 0 ? (totalTiles - batchCount) / totalTiles : 0,
      averageBatchSize: batchCount > 0 ? batchedTiles / batchCount : 0
    };
  }
}

// Export a function for easy integration
export function createBatchedLevel(k, levelData, levelConf) {
  const batcher = new LevelTileBatcher(k);
  
  // Log batching stats in debug mode
  if (window.gameConfig && window.gameConfig.debug) {
    const stats = batcher.getBatchingStats(levelData);
    console.log('Tile Batching Stats:', {
      originalDrawCalls: stats.totalTiles,
      optimizedDrawCalls: stats.batchCount + stats.unbatchedTiles,
      reduction: `${(stats.reductionRatio * 100).toFixed(1)}%`,
      averageBatchSize: stats.averageBatchSize.toFixed(1)
    });
  }
  
  return batcher.batchLevel(levelData, levelConf);
}