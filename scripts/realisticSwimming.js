// Realistic swimming physics for Onion's Life
// Simulates actual swimming mechanics with proper momentum and resistance

export class RealisticSwimming {
  constructor(k) {
    this.k = k;
    
    // Swimming physics constants
    this.WATER_RESISTANCE = 0.92; // How much velocity is dampened each frame
    this.SWIM_POWER = 120; // Force applied when swimming
    this.FLOAT_SPEED = -30; // Natural buoyancy when not moving
    this.MAX_SWIM_SPEED = 300; // Maximum swimming velocity
    this.STROKE_COOLDOWN = 0.3; // Time between swim strokes
    this.MOMENTUM_DECAY = 0.98; // How quickly momentum fades
    
    // State tracking
    this.lastStrokeTime = 0;
    this.swimMomentum = { x: 0, y: 0 };
    this.isSubmerged = false;
    this.submersionDepth = 0;
  }
  
  applySwimming(player, waterAreas) {
    // Check if player is in water
    const inWater = this.checkIfInWater(player, waterAreas);
    
    if (inWater) {
      if (!this.isSubmerged) {
        // Just entered water
        this.onEnterWater(player);
      }
      
      // Apply swimming physics
      this.updateSwimming(player);
      
    } else if (this.isSubmerged) {
      // Just left water
      this.onExitWater(player);
    }
    
    this.isSubmerged = inWater;
  }
  
  checkIfInWater(player, waterAreas) {
    if (!player.pos) return false;
    
    for (const water of waterAreas) {
      if (player.pos.x > water.x && 
          player.pos.x < water.x + water.width &&
          player.pos.y > water.y && 
          player.pos.y < water.y + water.height) {
        
        // Calculate how deep the player is
        this.submersionDepth = player.pos.y - water.y;
        return true;
      }
    }
    return false;
  }
  
  onEnterWater(player) {
    // Splash effect when entering
    if (player.vel && player.vel.y > 100) {
      // Big splash for fast entry
      this.createSplash(player.pos, player.vel.y / 100);
    }
    
    // Reduce gravity significantly
    this.k.setGravity(300); // Much lower than normal (1300)
    
    // Dampen initial velocity to simulate water impact
    if (player.vel) {
      player.vel.x *= 0.5;
      player.vel.y *= 0.3;
    }
  }
  
  onExitWater(player) {
    // Reset normal gravity
    this.k.setGravity(1300);
    
    // Reset momentum
    this.swimMomentum = { x: 0, y: 0 };
    
    // Small splash when leaving
    this.createSplash(player.pos, 0.5);
  }
  
  updateSwimming(player) {
    if (!player.vel) return;
    
    const currentTime = this.k.time();
    
    // Apply water resistance to all movement
    player.vel.x *= this.WATER_RESISTANCE;
    player.vel.y *= this.WATER_RESISTANCE;
    
    // Apply momentum from previous strokes
    this.swimMomentum.x *= this.MOMENTUM_DECAY;
    this.swimMomentum.y *= this.MOMENTUM_DECAY;
    player.vel.x += this.swimMomentum.x * this.k.dt();
    player.vel.y += this.swimMomentum.y * this.k.dt();
    
    // Natural buoyancy - slowly float up when not moving
    if (Math.abs(player.vel.y) < 10) {
      player.vel.y += this.FLOAT_SPEED * this.k.dt();
    }
    
    // Handle swimming input
    const canStroke = currentTime - this.lastStrokeTime > this.STROKE_COOLDOWN;
    
    // Jump button = swim up
    if (this.k.isKeyPressed("space") && canStroke) {
      this.performSwimStroke(player, 0, -1);
      this.lastStrokeTime = currentTime;
    }
    
    // Directional swimming with momentum
    if (canStroke) {
      let strokeX = 0;
      let strokeY = 0;
      
      if (this.k.isKeyDown("left")) strokeX = -1;
      if (this.k.isKeyDown("right")) strokeX = 1;
      if (this.k.isKeyDown("down")) strokeY = 0.5; // Can swim down but slower
      
      if (strokeX !== 0 || strokeY !== 0) {
        this.performSwimStroke(player, strokeX, strokeY);
        this.lastStrokeTime = currentTime;
      }
    }
    
    // Clamp maximum swimming speed
    const speed = Math.sqrt(player.vel.x * player.vel.x + player.vel.y * player.vel.y);
    if (speed > this.MAX_SWIM_SPEED) {
      const scale = this.MAX_SWIM_SPEED / speed;
      player.vel.x *= scale;
      player.vel.y *= scale;
    }
    
    // Subtle wave motion
    const waveOffset = Math.sin(currentTime * 3 + player.pos.x * 0.01) * 10;
    player.vel.y += waveOffset * this.k.dt();
    
    // Create occasional bubbles
    if (Math.random() < 0.02 && Math.abs(player.vel.x) + Math.abs(player.vel.y) > 50) {
      this.createBubble(player.pos);
    }
  }
  
  performSwimStroke(player, dirX, dirY) {
    // Add momentum in the stroke direction
    this.swimMomentum.x = dirX * this.SWIM_POWER;
    this.swimMomentum.y = dirY * this.SWIM_POWER;
    
    // Immediate velocity boost
    player.vel.x += dirX * this.SWIM_POWER * 0.5;
    player.vel.y += dirY * this.SWIM_POWER * 0.5;
    
    // Visual feedback - create ripples
    this.createRipple(player.pos);
    
    // Play swim sound if available
    try {
      this.k.play("swim", { volume: 0.3 });
    } catch (e) {
      // Sound not available
    }
  }
  
  createSplash(pos, intensity = 1) {
    const particleCount = Math.floor(5 * intensity);
    const k = this.k;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = 50 + Math.random() * 50 * intensity;
      const velocity = k.Vec2.fromAngle(angle).scale(speed);
      
      const particle = k.add([
        k.pos(pos.x, pos.y),
        k.circle(1 + Math.random() * 2),
        k.color(180, 220, 255),
        k.opacity(0.7),
        k.body({ gravityScale: 0.3 }),
        k.lifespan(0.4),
        "particle"
      ]);
      
      // Set initial velocity
      if (particle.vel) {
        particle.vel.x = velocity.x;
        particle.vel.y = velocity.y;
      }
      
      // Fade out over time
      particle.onUpdate(() => {
        particle.opacity -= k.dt() * 2;
      });
    }
  }
  
  createRipple(pos) {
    const k = this.k;
    const ripple = k.add([
      k.pos(pos.x, pos.y),
      k.circle(10),
      k.color(150, 200, 255),
      k.opacity(0.3),
      k.lifespan(0.8),
      "particle"
    ]);
    
    let radius = 10;
    ripple.onUpdate(() => {
      radius += 50 * k.dt();
      ripple.opacity -= k.dt() * 0.5;
      
      // Update visual by scaling instead of changing radius
      ripple.scaleTo(radius / 10);
    });
  }
  
  createBubble(pos) {
    const bubble = this.k.add([
      this.k.pos(pos.x + (Math.random() - 0.5) * 20, pos.y),
      this.k.circle(0.5 + Math.random() * 1.5),
      this.k.color(220, 240, 255),
      this.k.opacity(0.4),
      this.k.move(this.k.UP, 20 + Math.random() * 20),
      this.k.lifespan(1.5),
      "particle"
    ]);
    
    // Bubbles wobble as they rise
    const k = this.k;
    bubble.onUpdate(() => {
      bubble.pos.x += Math.sin(k.time() * 5 + bubble.pos.y * 0.1) * 10 * k.dt();
      bubble.opacity -= k.dt() * 0.3;
    });
  }
}

// Easy integration function
export function setupRealisticSwimming(k, player, waterAreas) {
  const swimming = new RealisticSwimming(k);
  
  k.onUpdate(() => {
    swimming.applySwimming(player, waterAreas);
  });
  
  return swimming;
}