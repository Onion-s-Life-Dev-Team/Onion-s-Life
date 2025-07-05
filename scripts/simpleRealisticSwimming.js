// Simple but realistic swimming physics for Onion's Life
// Focuses on core swimming feel without complex particle systems

export function setupSimpleSwimming(k, player, waterAreas) {
  // Swimming state
  let isInWater = false;
  let lastStrokeTime = 0;
  let swimVelocity = { x: 0, y: 0 };
  
  // Constants
  const WATER_GRAVITY = 400; // Much less than normal 1300
  const SWIM_STRENGTH = 250;
  const WATER_DRAG = 0.92;
  const BUOYANCY = -40; // Gentle upward force
  const STROKE_COOLDOWN = 0.25;
  
  k.onUpdate(() => {
    // Check if player is in water
    const wasInWater = isInWater;
    isInWater = checkInWater(player, waterAreas);
    
    if (isInWater) {
      // Just entered water
      if (!wasInWater) {
        k.setGravity(WATER_GRAVITY);
        // Dampen entry velocity
        if (player.vel) {
          player.vel.x *= 0.5;
          player.vel.y *= 0.3;
        }
      }
      
      // Apply water physics
      if (player.vel) {
        // Water drag
        player.vel.x *= WATER_DRAG;
        player.vel.y *= WATER_DRAG;
        
        // Apply swim velocity
        player.vel.x += swimVelocity.x * k.dt();
        player.vel.y += swimVelocity.y * k.dt();
        
        // Decay swim velocity
        swimVelocity.x *= 0.95;
        swimVelocity.y *= 0.95;
        
        // Gentle buoyancy
        player.vel.y += BUOYANCY;
        
        // Handle swimming input
        const currentTime = k.time();
        if (currentTime - lastStrokeTime > STROKE_COOLDOWN) {
          let didStroke = false;
          
          // Directional swimming
          if (k.isKeyDown("left")) {
            swimVelocity.x = -SWIM_STRENGTH;
            didStroke = true;
          }
          if (k.isKeyDown("right")) {
            swimVelocity.x = SWIM_STRENGTH;
            didStroke = true;
          }
          if (k.isKeyDown("up") || k.isKeyPressed("space")) {
            swimVelocity.y = -SWIM_STRENGTH;
            didStroke = true;
          }
          if (k.isKeyDown("down")) {
            swimVelocity.y = SWIM_STRENGTH * 0.7; // Slower diving
            didStroke = true;
          }
          
          if (didStroke) {
            lastStrokeTime = currentTime;
          }
        }
      }
    } else if (wasInWater) {
      // Just left water
      k.setGravity(1300);
      swimVelocity = { x: 0, y: 0 };
    }
  });
  
  function checkInWater(player, waterAreas) {
    if (!player.pos) return false;
    
    return waterAreas.some(water => {
      return player.pos.x > water.x && 
             player.pos.x < water.x + water.width &&
             player.pos.y > water.y && 
             player.pos.y < water.y + water.height;
    });
  }
}