import { getCookie, setCookie } from "./storage.js";

// Function to store coins
export function storeCoins(coins) {
  setCookie('coins', coins, 365);
}

// Function to retrieve coins
export function retrieveCoins() {
  let coins = getCookie('coins');
  return coins ? parseInt(coins, 10) : 0;
}

// Function to add one coin
export function addCoin() {
  let coins = retrieveCoins();
  coins += 1;
  storeCoins(coins);
}
