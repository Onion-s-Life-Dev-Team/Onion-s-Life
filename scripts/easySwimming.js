// Easy swimming physics - responsive and simple for testing
export function setupEasySwimming(k, player, waterAreas) {
  let isInWater = false;
  let canJumpOut = false;
  
  // Constants - tuned for easy movement
  const WATER_GRAVITY = 600; // Light but not too floaty
  const SWIM_SPEED = 200; // Direct movement speed
  const JUMP_OUT_SPEED = 400; // Strong jump to escape water
  const WATER_DRAG = 0.85; // Some resistance but not too much
  const FLOAT_FORCE = -50; // Gentle float
  
  k.onUpdate(() => {
    const wasInWater = isInWater;
    isInWater = checkInWater(player, waterAreas);
    
    if (isInWater) {
      // Just entered water
      if (!wasInWater) {
        k.setGravity(WATER_GRAVITY);
        // Soften landing
        if (player.vel && player.vel.y > 200) {
          player.vel.y *= 0.5;
        }
      }
      
      // Apply swimming controls - immediate response
      if (player.vel) {
        // Apply drag
        player.vel.x *= WATER_DRAG;
        player.vel.y *= WATER_DRAG;
        
        // Check if near water surface for jump
        const depthInWater = waterAreas.some(water => {
          if (player.pos.x > water.x && 
              player.pos.x < water.x + water.width &&
              player.pos.y > water.y && 
              player.pos.y < water.y + water.height) {
            // Return true if near surface (within 50 pixels)
            return player.pos.y - water.y < 50;
          }
          return false;
        });
        
        canJumpOut = depthInWater;
        
        // Direct movement controls - no cooldown, instant response
        if (k.isKeyDown("left")) {
          player.vel.x = -SWIM_SPEED;
        }
        if (k.isKeyDown("right")) {
          player.vel.x = SWIM_SPEED;
        }
        
        // Jump out of water when near surface
        if (k.isKeyPressed("space") && canJumpOut) {
          player.vel.y = -JUMP_OUT_SPEED; // Strong upward boost
          k.setGravity(1300); // Temporarily restore normal gravity
        } else if (k.isKeyDown("up") || k.isKeyDown("space")) {
          player.vel.y = -SWIM_SPEED;
        }
        
        if (k.isKeyDown("down")) {
          player.vel.y = SWIM_SPEED;
        }
        
        // Gentle float when not moving
        if (!k.isKeyDown("down") && Math.abs(player.vel.y) < 50) {
          player.vel.y += FLOAT_FORCE * k.dt();
        }
      }
    } else if (wasInWater) {
      // Left water - restore normal gravity
      k.setGravity(1300);
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