// levelMatrixUtils.js
// Shared, dependency-free level-matrix helpers used by the collision batcher,
// tile batcher, and level pipeline. Consolidates the greedy-meshing algorithm
// that previously lived in (at least) three separate files into one source.

// Greedy-mesh a single tile char into rectangular regions.
// Returns an array of regions shaped like the collision batcher's output:
//   { x: startCol, y: rowBelowBottom, width, height }
// where `y` is the bottom row boundary (startRow + height), matching how
// tiles are laid out with anchor("bot") in addLevel.
export function findGreedyRectangles(levelData, tileChar) {
  const regions = [];
  const visited = levelData.map((row) => new Uint8Array(row.length));

  for (let y = 0; y < levelData.length; y++) {
    const row = levelData[y];
    for (let x = 0; x < row.length; x++) {
      if (row[x] !== tileChar || visited[y][x]) continue;
      const region = largestRect(levelData, x, y, tileChar, visited);
      if (region) regions.push(region);
    }
  }
  return regions;
}

function largestRect(levelData, startX, startY, tileChar, visited) {
  // Max width on the starting row.
  let maxWidth = 0;
  const startRow = levelData[startY];
  for (let x = startX; x < startRow.length && startRow[x] === tileChar && !visited[startY][x]; x++) {
    maxWidth++;
  }
  if (maxWidth === 0) return null;

  // Extend downward tracking the minimum width across rows.
  let regionHeight = 1;
  let minWidth = maxWidth;

  for (let y = startY + 1; y < levelData.length; y++) {
    const row = levelData[y];
    let rowWidth = 0;
    for (let x = startX; x < startX + minWidth; x++) {
      if (x < row.length && row[x] === tileChar && !visited[y][x]) rowWidth++;
      else break;
    }
    if (rowWidth === 0) break;
    minWidth = Math.min(minWidth, rowWidth);
    regionHeight++;
  }

  // Mark all tiles in this region visited.
  for (let y = startY; y < startY + regionHeight; y++) {
    for (let x = startX; x < startX + minWidth; x++) visited[y][x] = 1;
  }

  return { x: startX, y: startY + regionHeight, width: minWidth, height: regionHeight };
}

// Per-tile water areas, intentionally NOT merged: the per-tile gaps are what
// enable the water escape mechanic.
export function computeWaterRegions(levelData, tileSize = 64) {
  const areas = [];
  for (let row = 0; row < levelData.length; row++) {
    const rowStr = levelData[row];
    for (let col = 0; col < rowStr.length; col++) {
      if (rowStr[col] === 'w') {
        areas.push({ x: col * tileSize, y: row * tileSize, width: tileSize, height: tileSize });
      }
    }
  }
  return areas;
}

// For each water tile ('w'), if there is a space two rows up at the same column
// (and the row between isn't also water),
// swap in a 'b' (bubble) tile. Returns a NEW array (does not mutate input).
export function createBubbles(levelData) {
  const map = levelData.map((row) => row.slice());
  for (let i = 0; i < map.length; i++) {
    const row = map[i];
    if (!row.includes('w') || !map[i - 1]) continue;
    for (let j = 0; j < row.length; j++) {
      if (row[j] === 'w' && map[i - 2] && map[i - 2][j] === ' ' && map[i - 1][j] !== 'w') {
        map[i - 2] = map[i - 2].slice(0, j) + 'b' + map[i - 2].slice(j + 1);
      }
    }
  }
  return map;
}
