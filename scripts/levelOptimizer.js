var levelChunks;

export function optimizeLevel(map) {
    levelChunks = searchLevel(map);
    for (var i = 0; i < map.length; i++) {
        map[i] = map[i].replaceAll("=====", "  +  ");
        map[i] = map[i].replaceAll("  +    +    +    +    +  ", "            _            ");
        map[i] = map[i].replaceAll("iiiiiiiiiiiiiiiiiiiiiiiii", "            ~            ");
        map[i] = map[i].replaceAll("            ~                        ~                        ~            ", "                                #                                ");
        //map[i] = map[i].replaceAll("^^^^^^^^^", "    &    ");
        //map[i] = map[i].replaceAll("^^^", " ` ");
    }
    console.log(levelChunks);
    return map;
}

function searchColumn(map, column) {
    let chunks = [];
    let startCoord;
    let currentChar;
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
                    chunks.push({ start: startCoord, end: i, tile: map[i].charAt(column), col: column });
                }
            } else if (map[i].charAt(column) == map[i - 1].charAt(column)) {
                if (map[i - 1].charAt(column) != map[i - 2].charAt(column)) {
                    startCoord = i - 1;
                }
                if (map[i].charAt(column) != map[i + 1].charAt(column)) {
                    chunks.push({ start: startCoord, end: i, tile: map[i].charAt(column), col: column });
                }
            }
        }
    }
    return chunks;
}

function searchLevel(map) {
    let chunks = [];
    for (var i = 0; i < map[0].length; i++) {
        let col = searchColumn(map, i);
        if (col.length != 0) {
            chunks.push(searchColumn(map, i));
        }
    }
    return chunks;
}

export function drawSprites(map) {
    /*
    for (var o = 0; o = levelChunks.length - 1; o++) {
        for (var i = 0; i = levelChunks[o].length - 1; i++) {
            console.log("Draw Sprites");
        }
    }*/
    drawSprite({
        sprite: "jumpy",
        pos: vec2(0, 576),
        width: 64,
        height: 64,
        tiled: true,
        anchor: "bot"
    })
}

function removeTiles(map, chunks) {

}
