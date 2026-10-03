// Function to set a cookie
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
      let date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }
  
  // Function to get a cookie
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
  
    