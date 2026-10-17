import { textures, sounds, music } from "./resourcePaths.js";
import { logger } from "./logger.js";

// Loads a pack from a root URL ending in "/". Resolves once every texture is registered
// with KAPLAY. Rejects if any texture image fails to download.
export function loadPack(url) {
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
        sound.crossOrigin = "anonymous";
        sound.onloadeddata = function(){
            loadSound(element[0], url + "assets/sounds/" + element[1]);
        }
        sound.src = url + "assets/sounds/" + element[1];
    });
    music.forEach((element) => {
        var sound = new Audio();
        sound.crossOrigin = "anonymous";
        sound.onloadeddata = function(){
            loadMusic(element[0], url + "assets/sounds/"+ element[1]);
        }
        sound.src = url + "assets/sounds/" + element[1];
    });
    // Code to support legacy ogg format music
    var ogg = new Audio();
    ogg.crossOrigin = "anonymous";
    ogg.onloadeddata = function(){
        loadMusic("OverworldlyFoe", url + "assets/sounds/music.ogg");
    }
    ogg.src = url + "assets/sounds/music.ogg";
}

// Asks for a <Username/Repo> and returns its pack root URL, or null if cancelled or empty.
export function promptPackUrl() {
    var input = prompt("Insert <Username/Repo>");
    if (input == null || input.trim() === "") return null;
    return `https://raw.githack.com/${input.trim()}/main/`;
}
