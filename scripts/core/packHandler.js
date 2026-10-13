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
    // Sounds not yet supported. Sadly they may be never supported, at least with the current protocol I'm using with repo URLs.
    /*
    sounds.forEach((element) => {
        var sound = new Audio();
        sound.crossOrigin = "anonymous";
        sound.onloadeddata = function(){
            logger.info("Loaded Data")
            loadSound(element[0], url + element[1]);
        }
        sound.src = url + element[1];
    });
    music.forEach((element) => {
        var sound = new Audio();
        sound.crossOrigin = "anonymous";
        sound.onloadeddata = function(){
            logger.info("Loaded Data")
            loadMusic(element[0], url + element[1]);
        }
        sound.src = url + element[1];
    });
    */
}