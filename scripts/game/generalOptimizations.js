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
    this.setupObjectPooling();
    this.optimizeParticles();
    this.setupSmartCulling();
    this.optimizeCollisions();
    this.setupMemoryManagement();
  }

  // Object pooling for frequently created/destroyed objects
  setupObjectPooling() {
    const pools = {
      particles: [],
      effects: []
    };

    // Override destroy to return objects to pool
    const originalDestroy = this.k.destroy;
    this.k.destroy = (obj) => {
      if (obj.is && obj.is("particle") && pools.particles.length < 100) {
        obj.hidden = true;
        obj.paused = true;
        pools.particles.push(obj);
      } else {
        originalDestroy(obj);
      }
    };

    // Store pools for reuse
    this.k.objectPools = pools;
  }

  // Optimize particle effects
  optimizeParticles() {
    // Limit total particles
    const maxParticles = 50;
    
    this.k.onUpdate("particle", () => {
      const particles = this.k.get("particle");
      if (particles.length > maxParticles) {
        // Remove oldest particles
        particles.slice(0, particles.length - maxParticles).forEach(p => p.destroy());
      }
    });
  }

  // Smart culling based on distance from player
  setupSmartCulling() {
    // Use culling distance from gameConfig if available, otherwise default to 1000
    const cullDistance = (window.gameConfig && window.gameConfig.cullingDistance) || 1000;
    console.log(`Smart culling initialized with distance: ${cullDistance}px`);

    this.k.onUpdate(() => {
      this.frameSkip++;
      // Use longer interval for large levels to reduce get("*") overhead
      const updateInterval = window._largeLevelLoaded ? 30 : 5;
      if (this.frameSkip % updateInterval !== 0) return;

      const player = this.k.get("player")[0];
      if (!player || !player.pos) return;

      // Update visibility for all objects with offscreen component
      this.k.get("*", { recursive: true }).forEach(obj => {
        if (obj.offscreen && obj.pos && obj !== player) {
          const dist = obj.pos.dist(player.pos);

          // Hide far objects
          if (dist > cullDistance && !obj.hidden) {
            obj.hidden = true;
          }
          // Show near objects
          else if (dist <= cullDistance && obj.hidden) {
            obj.hidden = false;
          }
        }
      });
    });
  }

  // Optimize collision checks
  optimizeCollisions() {
    // Skip collision checks for hidden objects
    const originalOnCollide = this.k.onCollide;
    this.k.onCollide = (tag1, tag2, action) => {
      return originalOnCollide(tag1, tag2, (obj1, obj2) => {
        // Skip if either object is hidden
        if (obj1.hidden || obj2.hidden) return;
        action(obj1, obj2);
      });
    };
  }

  // Memory management - cleanup unused resources
  setupMemoryManagement() {
    this.k.onUpdate(() => {
      this.lastCleanup++;
      if (this.lastCleanup < this.cleanupInterval) return;
      this.lastCleanup = 0;
      
      // Remove particles that have lived too long
      this.k.get("particle").forEach(p => {
        if (p.lifespan && p.time && p.time > p.lifespan * 2) {
          p.destroy();
        }
      });
      
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
      particles: this.k.get("particle").length,
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

// FPS counter with performance warnings
export class FPSMonitor {
  constructor(k) {
    this.k = k;
    this.samples = [];
    this.maxSamples = 60;
    this.warningThreshold = 30;
    this.criticalThreshold = 20;
  }

  update() {
    const fps = this.k.debug.fps();
    this.samples.push(fps);
    
    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }
    
    const avgFPS = this.getAverageFPS();
    
    // Warn about performance issues
    if (avgFPS < this.criticalThreshold) {
      console.warn(`Critical performance: ${avgFPS.toFixed(1)} FPS`);
    } else if (avgFPS < this.warningThreshold) {
      console.warn(`Low performance: ${avgFPS.toFixed(1)} FPS`);
    }
    
    return avgFPS;
  }

  getAverageFPS() {
    if (this.samples.length === 0) return 60;
    return this.samples.reduce((a, b) => a + b) / this.samples.length;
  }
}