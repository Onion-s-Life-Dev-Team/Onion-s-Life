import { logger } from "./logger.js";
import { getCookie, setCookie } from "./storage.js";

const SKINS_KEY = 'unlockedSkins';

// Function to get all unlocked skins from local storage
function getUnlockedSkins() {
    const skins = getCookie(SKINS_KEY);
    return skins ? JSON.parse(skins) : [];
}

// Function to save all unlocked skins to local storage
function saveUnlockedSkins(skins) {
    setCookie(SKINS_KEY, JSON.stringify(skins), 9999);
    logger.debug('Saved unlocked skins:', skins);
}

// Function to check if a skin is unlocked
export function hasSkin(skinName) {
    const skins = getUnlockedSkins();
    return skins.includes(skinName);
}

// Function to save/unlock a new skin
export function saveSkin(skinName) {
    const skins = getUnlockedSkins();
    if (!skins.includes(skinName)) {
        skins.push(skinName);
        saveUnlockedSkins(skins);
    }
}
