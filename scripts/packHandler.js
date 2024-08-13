import { textures, sounds, music } from "./resourcePaths.js";

export function getPack() {
    const url = prompt("Insert Pack URL:");
    if (url.charAt(url.length - 1) != "/") {
        console.log(url);
        url += "/";
        console.log(url);
    }

    textures.forEach((element) => {
        var img = new Image();
        img.onload = function(){
            loadSprite(element[0], url + element[1]);
        }
        img.src = url + element[1];
    });
    sounds.forEach((element) => {
        var sound = new Audio();
        sound.onload = function(){
            loadSound(element[0], url + element[1]);
        }
        sound.src = url + element[1];
    });
    music.forEach((element) => {
        var sound = new Audio();
        sound.onload = function(){
            loadSprite(element[0], url + element[1]);
        }
        sound.src = url + element[1];
    });
}