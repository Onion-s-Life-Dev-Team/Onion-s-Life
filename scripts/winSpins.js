// Cookie management functions
export function setCookie(name, value, days) {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
  
export function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
  
export function eraseCookie(name) {
    document.cookie = name + '=; Max-Age=-99999999;';
}
  
export function getWinSpins() {
    const spins = getCookie("winSpins");
    return spins ? parseInt(spins) : 0;
}
  
export function addWinSpin() {
    let spins = getWinSpins();
    spins++;
    setCookie("winSpins", spins, 7);
}
  
export function useWinSpin() {
    let spins = getWinSpins();
    if (spins > 0) {
      spins--;
      setCookie("winSpins", spins, 7);
      return true;
    }
    return false;
}
  
export function spinWheel() {
    const prizes = ["coins", "skin", "winSpin"];
    const prize = prizes[Math.floor(Math.random() * prizes.length)];
    switch (prize) {
      case "coins":
        addCoin();
        alert("You won coins!");
        break;
      case "skin":
        const randomSkin = "onion-" + ["beach", "blue", "dark", "gold", "watermelon", "eggplant", "magic", "pumpkin", "invert", "ocean", "secret"][Math.floor(Math.random() * 11)];
        saveSkin(randomSkin);
        alert("You won a skin!");
        break;
      case "winSpin":
        addWinSpin();
        alert("You won an extra WinSpin!");
        break;
    }
}
  