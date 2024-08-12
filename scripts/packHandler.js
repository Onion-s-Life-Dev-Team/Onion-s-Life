export function getPack() {
    const url = prompt("Insert Pack URL:");
    if (url.charAt(url.length - 1) != "/") {
        console.log(url);
        url += "/";
        console.log(url);
    }

    for (var i = 0; i < textureIds.length; i++) {
            loadSprite(textureIds[i], url + texturePaths[i]);
    }
}