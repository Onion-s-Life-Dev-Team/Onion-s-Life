// Batched Ground Renderer - Following official Kaplay optimization guide
// Separates collision (game objects) from rendering (batched drawSprite calls)
// Uses grid-based spatial indexing for O(visible) instead of O(all) culling

export class BatchedGroundRenderer {
  constructor(k) {
    this.k = k;
    this.tileGrid = new Map();  // Map of "gridX,gridY" -> sprite name
    this.tileSize = 64;
    this.enabled = true;
  }

  // Call this when loading a level to register ground tile positions
  registerGroundTiles(levelData, tileSize = 64) {
    this.tileGrid.clear();
    this.tileSize = tileSize;

    // Map of tile characters to their sprite names
    const groundSprites = {
      '=': 'grass',
      's': 'sand',
      'w': 'water',
    };

    for (let row = 0; row < levelData.length; row++) {
      const rowStr = levelData[row];
      for (let col = 0; col < rowStr.length; col++) {
        const char = rowStr[col];
        if (groundSprites[char]) {
          // Store by grid position for O(1) lookup
          this.tileGrid.set(`${col},${row}`, groundSprites[char]);
        }
      }
    }

    console.log(`BatchedGroundRenderer: Registered ${this.tileGrid.size} ground tiles`);
  }

  // Set up the onDraw handler - call this once after k is initialized
  setupRenderer() {
    const k = this.k;
    const self = this;

    // This runs every frame, drawing only visible ground tiles
    k.onDraw(() => {
      if (!self.enabled || self.tileGrid.size === 0) return;

      const tileSize = self.tileSize;

      // Get camera position and screen dimensions
      const cam = k.camPos();
      const screenWidth = k.width();
      const screenHeight = k.height();

      // Calculate visible grid range (with padding for anchor("bot") offset)
      // With anchor("bot"), tiles extend UP from their grid position
      const minGridX = Math.floor((cam.x - screenWidth / 2 - tileSize) / tileSize);
      const maxGridX = Math.ceil((cam.x + screenWidth / 2 + tileSize) / tileSize);
      const minGridY = Math.floor((cam.y - screenHeight / 2 - tileSize) / tileSize);
      const maxGridY = Math.ceil((cam.y + screenHeight / 2 + tileSize) / tileSize);

      let tilesDrawn = 0;

      // Only iterate through visible grid cells - much faster!
      for (let gridY = minGridY; gridY <= maxGridY; gridY++) {
        for (let gridX = minGridX; gridX <= maxGridX; gridX++) {
          const sprite = self.tileGrid.get(`${gridX},${gridY}`);
          if (sprite) {
            // Draw at grid position with anchor "bot" to match collision objects
            k.drawSprite({
              sprite: sprite,
              pos: k.vec2(gridX * tileSize, gridY * tileSize),
              anchor: "bot",
              opacity: sprite === 'water' ? 0.8 : 1,
            });
            tilesDrawn++;
          }
        }
      }

      // Debug display in corner (only when debug mode is on)
      if (window.gameConfig?.debug) {
        k.drawText({
          text: `BatchedRenderer v3\nTiles: ${tilesDrawn}/${self.tileGrid.size}\nGrid: ${maxGridX - minGridX}x${maxGridY - minGridY}`,
          pos: k.vec2(cam.x - screenWidth/2 + 10, cam.y - screenHeight/2 + 10),
          size: 16,
          color: k.rgb(255, 255, 0),
        });
      }
    });

    console.log('BatchedGroundRenderer: onDraw handler set up');
  }

  // Enable/disable rendering
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  // Clear all registered tiles
  clear() {
    this.tileGrid.clear();
  }

  // Get stats for debugging
  getStats() {
    return {
      totalTiles: this.tileGrid.size,
      enabled: this.enabled
    };
  }
}

// Factory function
export function createBatchedGroundRenderer(k) {
  return new BatchedGroundRenderer(k);
}
