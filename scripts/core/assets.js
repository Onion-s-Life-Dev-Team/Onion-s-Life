import { textures, sounds, music } from "./resourcePaths.js";
import { logger } from "./logger.js";

/*
 * Go to scripts/core/resourcePaths.js to add new textures/sounds/music
 * - LagTheSystem
 */

export default function loadAssets() {
  // Enlarge the Resource Timing buffer so all asset entries are recorded for benchmarking purposes.
  performance.setResourceTimingBufferSize(1000);

  // load sprites
  const pending = [];
  pending.push(...batchAssets(textures, "sprite"));
  // load sound
  pending.push(...batchAssets(sounds, "sound"));
  // load music
  pending.push(...batchAssets(music, "music"));
  
  pending.push(loadFont('apl386', 'assets/apl386.woff2', { outline: 4, filter: 'linear'}));

  if (import.meta.env.DEV) {
    const allAssets = [...textures, ...sounds, ...music, ["apl386", "assets/apl386.woff2"]];
    logger.debug(`[assets] Loading ${allAssets.length} assets...`);
    Promise.allSettled(pending).then(() => logAssetSizes(allAssets));
  }
}

function batchAssets(data, loadType) {
  return data.map((element) => {
    if (loadType == "sprite") {
      return loadSprite(element[0], element[1]);
    } else if (loadType == "sound") {
      return loadSound(element[0], element[1]);
    } else if (loadType == "music") {
      return loadMusic(element[0], element[1]);
    } else {
      logger.error(element[0] + " failed to load! Invalid loadType.");
      return Promise.resolve();
    }
  });
}

// Logs the transferred size (KB) of each asset using the Resource Timing API.
// Uses encodedBodySize so cached responses (service worker / HTTP cache) still report their size.
function logAssetSizes(assets) {
  const rows = [];
  let totalKB = 0;
  for (const [name, path] of assets) {
    const url = new URL(path, location.href).href;
    const entry = performance.getEntriesByName(url).pop();
    const bytes = entry ? entry.encodedBodySize || entry.transferSize : 0;
    const kb = bytes / 1024;
    totalKB += kb;
    rows.push({ asset: name, path, KB: +kb.toFixed(2) });
  }
  if (import.meta.env.DEV) console.table(rows);
  logger.debug(`Total asset size: ${totalKB.toFixed(2)} KB across ${rows.length} assets`);
}
