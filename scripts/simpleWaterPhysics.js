// Simple water physics with reliable escape mechanism
export function setupSimpleWaterPhysics(k, player, waterAreas) {
  let isInWater = false;
  let wasInWater = false;

  // Constants
  const WATER_GRAVITY = 500;
  const NORMAL_GRAVITY = 1300;
  const SWIM_SPEED = 250;
  const WATER_JUMP_POWER = 650; // Strong jump to escape
  const WATER_DRAG = 0.9;

  k.onUpdate(() => {
    wasInWater = isInWater;
    isInWater = false;

    // Check if player is in any water area
    for (const water of waterAreas) {
      if (player.pos.x > water.x &&
          player.pos.x < water.x + water.width &&
          player.pos.y > water.y &&
          player.pos.y < water.y + water.height) {
        isInWater = true;
        break;
      }
    }

    if (isInWater) {
      // Just entered water
      if (!wasInWater) {
        k.setGravity(WATER_GRAVITY);
      }

      // Apply water physics
      if (player.vel) {
        // Water drag
        player.vel.x *= WATER_DRAG;
        player.vel.y *= WATER_DRAG;

        // Swimming controls
        if (k.isKeyDown("left")) {
          player.vel.x = -SWIM_SPEED;
        }
        if (k.isKeyDown("right")) {
          player.vel.x = SWIM_SPEED;
        }
        if (k.isKeyDown("down")) {
          player.vel.y = SWIM_SPEED * 0.7;
        }

        // Jump boost to escape water — works with up, w, and space
        // Must check BEFORE swim so the boost isn't overwritten
        if (k.isKeyPressed("space") || k.isKeyPressed("up") || k.isKeyPressed("w")) {
          player.vel.y = -WATER_JUMP_POWER;
          // Switch to normal gravity for a proper arc out of water
          k.setGravity(NORMAL_GRAVITY);
        }
        // Swimming up — only apply swim speed if not already moving up faster (from jump boost)
        else if (k.isKeyDown("up") || k.isKeyDown("space") || k.isKeyDown("w")) {
          if (player.vel.y > -SWIM_SPEED) {
            player.vel.y = -SWIM_SPEED;
          }
        }
      }
    } else {
      // Not in water
      if (wasInWater) {
        // Just left water - ensure normal gravity
        k.setGravity(NORMAL_GRAVITY);
      }
    }
  });
}
