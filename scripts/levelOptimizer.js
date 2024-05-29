export default function optimizeLevel(map) {
    for (var i = 0; i < map.length; i++) {
        map[i] = map[i].replaceAll("=====", "  +  ")
        map[i] = map[i].replaceAll("  +    +    +    +    +  ", "            _            ")
        map[i] = map[i].replaceAll("iiiiiiiiiiiiiiiiiiiiiiiii", "            ~            ")
        map[i] = map[i].replaceAll("            ~                        ~                        ~            ", "                                #                                ")
        //map[i] = map[i].replaceAll("^^^^^^^^^", "    &    ")
        //map[i] = map[i].replaceAll("^^^", " ` ")
    }
    return map
}
