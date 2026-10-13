import { textures, sounds, music } from "./resourcePaths.js";
import { logger } from "./logger.js";

export function getPack() {
    var url = prompt("Insert <Username/Repo>");
    if (url != null) {
        url = `https://raw.githack.com/${url}/main/`
    } else {
        return;
    }

    logger.info("Enabling pack from url: " + url);
    textures.forEach((element) => {
        var img = new Image();
        img.onload = function(){
            loadSprite(element[0], url + "assets/sprites/" + element[1]);
        }
        img.src = url + "assets/sprites/" + element[1];
    });
    sounds.forEach((element) => {
        var sound = new Audio();
        sound.onload = function(){
            loadSound(element[0], url + "assets/sounds/" + element[1]);
        }
        sound.src = url + "assets/sounds/" + element[1];
    });
    music.forEach((element) => {
        var sound = new Audio();
        sound.onload = function(){
            loadMusic(element[0], url + "assets/sounds/"+ element[1]);
        }
        sound.src = url + "assets/sounds/" + element[1];
    });
    
}