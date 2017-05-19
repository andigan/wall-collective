export function clickme(id, time) {
  setTimeout(function () {
    document.getElementById(id).dispatchEvent(new Event ('click'));
  }, time);
}

export function getCookie(cKey) {
  let i,
      keyValue,
      // create an array of key=value pairs e.g. ['name=Shannon', 'sessionID=Vy94J6V1W']
      cookiesArray = document.cookie.split(';');

  for ( i = 0; i < cookiesArray.length; i++) {
    keyValue = cookiesArray[i];

    // remove leading empty characters from cookie element
    while (keyValue.charAt(0) === ' ') keyValue = keyValue.substring(1);

    // if the cKey can be found in the element, return the key portion of the element
    if (keyValue.indexOf(cKey) === 0)
      return keyValue.substring(cKey.length + 1, keyValue.length);
  };
  // else return empty string
  return '';
}

export function setCookie(cKey, cValue, daysTilExpire) {
  let expiration,
      d = new Date();

  d.setTime(d.getTime() + (daysTilExpire * 24 * 60 * 60 * 1000));
  expiration = 'expires=' + d.toUTCString();
  document.cookie = cKey + '=' + cValue + '; ' + expiration;
}
