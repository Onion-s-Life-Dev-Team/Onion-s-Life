//take a passed in input of a level and find the water sprites (w)
//two strings before, in the same position in the string, add in a b sprite
//this will, in all likelihood, replace a space character
export default function fixWater(map) {
    // Create a deep copy of the map array to avoid mutating the original
    let newMap = map.map(row => row.slice());

    for (var i = 0; i < newMap.length; i++) {
        if (newMap[i].includes("w")) {
            // Get the position of all the 'w'
            var indices = [];
            for (var j = 0; j < newMap[i].length; j++) {
                if (newMap[i][j] === 'w') indices.push(j);
            }
            // For each 'w', check if there is a space in the string two elements before it at the same position as 'w'
            // If there is, and there is NOT a water element in the string one element before it at the same position replace it with a 'b'
            for (var j = 0; j < indices.length; j++) {
                if (newMap[i - 2] && newMap[i - 2][indices[j]] === ' ' && newMap[i - 1] && newMap[i - 1][indices[j]] !== 'w') {
                    newMap[i - 2] = newMap[i - 2].substring(0, indices[j]) + 'b' + newMap[i - 2].substring(indices[j] + 1);
                }
            }
        }
    }
    return newMap;
}
