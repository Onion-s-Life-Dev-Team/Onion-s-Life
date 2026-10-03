const SKINS_KEY = 'unlockedSkins';

function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Function to get all unlocked skins from local storage
function getUnlockedSkins() {
    const skins = getCookie(SKINS_KEY);
    return skins ? JSON.parse(skins) : [];
}

// Function to save all unlocked skins to local storage
function saveUnlockedSkins(skins) {
    setCookie(SKINS_KEY, JSON.stringify(skins), 9999);
    console.log('Saved unlocked skins:', skins);
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

