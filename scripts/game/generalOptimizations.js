// General performance optimizations that work across all levels
// These are safe optimizations that don't break game mechanics

export class GeneralOptimizer {
  constructor(k) {
    this.k = k;
    this.frameSkip = 0;
    this.lastCleanup = 0;
    this.cleanupInterval = 60; // Cleanup every second
  }

  // Apply all general optimizations
  initialize() {
    this.setupMemoryManagement();
  }

  // Memory management - cleanup unused resources
  setupMemoryManagement() {
    this.k.onUpdate(() => {
      this.lastCleanup++;
      if (this.lastCleanup < this.cleanupInterval) return;
      this.lastCleanup = 0;
      
      // Clean up any objects that fell too far
      const fallLimit = 3000;
      this.k.get("*", { recursive: true }).forEach(obj => {
        if (obj.pos && obj.pos.y > fallLimit && !obj.is("player")) {
          obj.destroy();
        }
      });
    });
  }

  // Get current performance stats
  getStats() {
    return {
      objects: this.k.get("*", { recursive: true }).length,
      fps: this.k.debug.fps(),
      drawCalls: this.k.debug.drawCalls()
    };
  }
}

// Helper function to apply safe rendering optimizations
export function applySafeRenderingOptimizations(k) {
  // Batch similar draw operations
  if (k.pixelDensity) {
    // Lower pixel density on mobile for better performance
    const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      k.pixelDensity(1);
    }
  }
  
  // Enable image smoothing for better performance
  const canvas = k.canvas;
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "low";
    }
  }
}
