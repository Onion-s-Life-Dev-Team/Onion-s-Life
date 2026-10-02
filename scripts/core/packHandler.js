import { textures, sounds, music } from "./resourcePaths.js";

export function getPack() {
    var url = prompt("Insert Pack URL:");
    if (url != null) {
        if (url.charAt(url.length - 1) != "/") {
            url += "/";
        }
    } else {
        return;
    }

    textures.forEach((element) => {
        var img = new Image();
        img.onload = function(){
            loadSprite(element[0], url + element[1]);
        }
        img.src = url + element[1];
    });
    // Sounds not yet supported. Sadly they may be never supported, at least with the current protocol I'm using with repo URLs.
    /*
    sounds.forEach((element) => {
        var sound = new Audio();
        sound.crossOrigin = "anonymous";
        sound.onloadeddata = function(){
            console.log("Loaded Data")
            loadSound(element[0], url + element[1]);
        }
        sound.src = url + element[1];
    });
    music.forEach((element) => {
        var sound = new Audio();
        sound.crossOrigin = "anonymous";
        sound.onloadeddata = function(){
            console.log("Loaded Data")
            loadMusic(element[0], url + element[1]);
        }
        sound.src = url + element[1];
    });
    */
}