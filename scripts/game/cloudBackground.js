// A lightweight world-space cloud backdrop for gameplay scenes.
// Clouds drift to the right independently of camera movement and are drawn
// before the level pipeline's onDraw renderer, so level art is always in front.

const MIN_CLOUDS = 4;
const MAX_CLOUDS = 16;
const CLOUD_SPACING = 320;

export function setupCloudBackground(k) {
  const initialWidth = k.width();
  const initialHeight = k.height();
  const initialCamera = k.camPos();
  const cloudCount = Math.min(MAX_CLOUDS, Math.max(MIN_CLOUDS, Math.ceil(initialWidth / CLOUD_SPACING)));
  const clouds = Array.from({ length: cloudCount }, (_, index) => ({
    x: initialCamera.x - initialWidth / 2 + ((index + 0.5) / cloudCount) * initialWidth,
    y: initialCamera.y - initialHeight / 2 + k.rand(initialHeight * 0.08, initialHeight * 0.46),
    scale: k.rand(0.45, 0.8),
    opacity: k.rand(0.55, 0.85),
    speed: k.rand(12, 28),
  }));

  // Register before the level pipeline's onDraw callback. KAPLAY runs global
  // onDraw listeners before scene objects; the ground's later callback then
  // paints over the clouds, as do regular level objects.
  k.onDraw(() => {
    const dt = k.dt();
    const width = k.width();
    const height = k.height();
    const camera = k.camPos();

    for (const cloud of clouds) {
      cloud.x += cloud.speed * dt;

      // Recycle the cloud in world coordinates. Camera movement never changes
      // its motion; a cloud may move off-camera and later re-enter view.
      if (cloud.x - 111 * cloud.scale > camera.x + width / 2) {
        cloud.x = camera.x - width / 2 - 111 * cloud.scale;
        cloud.y = camera.y - height / 2 + k.rand(height * 0.08, height * 0.46);
      }

      k.drawSprite({
        sprite: 'cloud',
        pos: k.vec2(cloud.x, cloud.y),
        scale: k.vec2(cloud.scale),
        opacity: cloud.opacity,
        anchor: 'center',
      });
    }
  });

  return clouds;
}