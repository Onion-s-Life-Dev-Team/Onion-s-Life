// Returns the raw value of a cookie, or null when it is not set.
// Splits on the first "=" only, so values containing "=" are preserved.
export function getCookie(name) {
  const prefix = name + "=";
  for (const part of document.cookie.split(";")) {
    const cookie = part.trimStart();
    if (cookie.startsWith(prefix)) return cookie.substring(prefix.length);
  }
  return null;
}

// Stores a cookie for the whole site. Omit `days` for a session cookie.
export function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value ?? "") + expires + "; path=/";
}

// Removes a cookie previously set with setCookie (same path).
export function deleteCookie(name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/";
}
