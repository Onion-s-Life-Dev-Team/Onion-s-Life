export function optimizeLevel(map) {
    map = checkLevel(map);
    for (var i = 0; i < map.length; i++) {
        map[i] = map[i].replaceAll("=====", "  +  ");
        map[i] = map[i].replaceAll("  +    +    +    +    +  ", "            _            ");
        map[i] = map[i].replaceAll("iiiiiiiiiiiiiiiiiiiiiiiii", "            ~            ");
        map[i] = map[i].replaceAll("            ~                        ~                        ~            ", "                                #                                ");
        //map[i] = map[i].replaceAll("^^^^^^^^^", "    &    ");
        //map[i] = map[i].replaceAll("^^^", " ` ");
    }
    return map;
}

function removeTiles(map, start, end, tile, col) {
    for (var i = start; i < end; i++) {
        map[i] = replaceChar(map[i], col)
    }
    return map
}

function checkColumn(map, column) {
    let startCoord;
    for (var i = 0; i < map.length; i++) {
        if (map[i].charAt(column) == "=") {
            if (i == 0) {
                startCoord = 0;
            } else if (i == 1) {
                if (map[i].charAt(column) != map[i - 1].charAt(column)) {
                    startCoord = 1;
                }
            } else if (i == map.length - 1) {
                if (map[i].charAt(column) == map[i - 1].charAt(column)) {
                    map = removeTiles(map, startCoord, i, map[i].charAt(column), column)
                }
            } else if (map[i].charAt(column) == map[i - 1].charAt(column)) {
                if (map[i - 1].charAt(column) != map[i - 2].charAt(column)) {
                    startCoord = i - 1;
                }
                if (map[i].charAt(column) != map[i + 1].charAt(column)) {
                    map = removeTiles(map, startCoord, i, map[i].charAt(column), column)
                }
            }
        }
    }
    return map
}

export function checkLevel(map) {
    for (var i = 0; i < map[0].length; i++) {
        map = checkColumn(map, i);
    }
    return map
}

function drawColumn(map, column) {
    let startCoord;
    for (var i = 0; i < map.length; i++) {
        if (map[i].charAt(column) == "=") {
            if (i == 0) {
                startCoord = 0;
            } else if (i == 1) {
                if (map[i].charAt(column) != map[i - 1].charAt(column)) {
                    startCoord = 1;
                }
            } else if (i == map.length - 1) {
                if (map[i].charAt(column) == map[i - 1].charAt(column)) {
                    drawChunk(startCoord - 1, i, map[i].charAt(column), column)
                }
            } else if (map[i].charAt(column) == map[i - 1].charAt(column)) {
                if (map[i - 1].charAt(column) != map[i - 2].charAt(column)) {
                    startCoord = i - 1;
                }
                if (map[i].charAt(column) != map[i + 1].charAt(column)) {
                    drawChunk(startCoord - 1, i, map[i].charAt(column), column)
                }
            }
        }
    }
}

export function drawLevel(map) {
    for (var i = 0; i < map[0].length; i++) {
        drawColumn(map, i);
    }
}

function drawChunk(start, end, tile, col) {
    drawSprite({
        sprite: "jumpy",
        pos: vec2(col * 64, start * 64),
        width: 64,
        height: (end * 64) - (start * 64),
        tiled: true,
        anchor: "top"
    })
}


// code that isn't stolen off the internet
// VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV
function replaceChar(orig, index) {
    let first = orig.substr(0, index);
    let last = orig.substr(index + 1);

    let newStr = first + " " + last;
    return newStr
}
