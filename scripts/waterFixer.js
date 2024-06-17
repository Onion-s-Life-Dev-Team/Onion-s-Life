//take a passed in input of a level and find the water sprites (w)
//two strings before, in the same position in the string, add in a b sprite
//this will, in all likelihood, replace a space character
export default function fixWater(map) {
    for (var i = 0; i < map.length; i++) {
        if(map[i].includes("w")) {
            //get the position of all the w
            var indices = [];
            for(var j = 0; j < map[i].length; j++) {
                if(map[i][j] === 'w') indices.push(j);
            }
            // for each w, check if there is a space in the string two elemens before it at the same position as w
            // if there is, and there is NOT a water element in the string one element before it at the same position replace it with a b
            for(var j = 0; j < indices.length; j++) {
                if(map[i-2][indices[j]] === ' ' && map[i-1][indices[j]] !== 'w') {
                    map[i-2] = map[i-2].substring(0, indices[j]) + 'b' + map[i-2].substring(indices[j]+1);
                }
            }

        }
    }
    return map
}