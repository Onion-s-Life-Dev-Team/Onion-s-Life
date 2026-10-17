import { addCoin } from "./coinManager.js";
import { saveSkin } from "./skinManager.js";
import { getCookie, setCookie } from "./storage.js";

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
      case "coins": {
        addCoin();
        alert("You won coins!");
        break;
      }
      case "skin": {
        const randomSkin = "onion-" + ["beach", "blue", "dark", "gold", "watermelon", "eggplant", "magic", "pumpkin", "invert", "ocean", "secret"][Math.floor(Math.random() * 11)];
        saveSkin(randomSkin);
        alert("You won a skin!");
        break;
      }
      case "winSpin": {
        addWinSpin();
        alert("You won an extra WinSpin!");
        break;
      }
    }
}
