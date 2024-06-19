export default function optimizeLevel(map) {
    for (var i = 0; i < map.length; i++) {
        map[i] = map[i].replaceAll("=====", "  +  ")
        map[i] = map[i].replaceAll("  +    +    +    +    +  ", "            _            ")
        map[i] = map[i].replaceAll("iiiiiiiiiiiiiiiiiiiiiiiii", "            ~            ")
        map[i] = map[i].replaceAll("            ~                        ~                        ~            ", "                                #                                ")
        //map[i] = map[i].replaceAll("^^^^^^^^^", "    &    ")
        //map[i] = map[i].replaceAll("^^^", " ` ")
    }
    return map;
}

function searchColumn(map, column) {
    let chunks = [];
    let startCoord;
    let currentChar;
    for (var i = 0; i < map.length ; i++) {
        if (i == 0) {
            startCoord = 0;
        } else if (i == 1) {
            if (map[i].charAt(column) != map[i - 1].charAt(column)) {
                startCoord = 1;
            }
        } else if (i == map.length - 1) {
            if (map[i].charAt(column) == map[i - 1].charAt(column)) {
                chunks.push({start: startCoord, end: i + 1, tile: map[i].charAt(column)});
            }
        } else if (map[i].charAt(column) == map[i - 1].charAt(column)) {
            console.log("Match Found");
            if (map[i - 1].charAt(column) != map[i - 2].charAt(column)) {
                startCoord = i - 1;
            }
            if(map[i].charAt(column) != map[i + 1].charAt(column)) {
                chunks.push({start: startCoord, end: i + 1, tile: map[i].charAt(column)});
            }
        }
    }
    return chunks;
}
