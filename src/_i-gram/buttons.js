import config from '../_config/config';

import { setInstaAvailable } from '../_i-gram/actions';

export function instaButtonsInit() {
  createButton('a2', 'insta-logout', 'instagram logout', '/icons/debug_icon.png', 'button-tools');
  createButton('u3', 'insta-upload', 'Instagram', '/icons/glyph-logo_May2016.png', 'button-tools');
}


function createButton(targetID, action, text, iconPath, buttonClass) {
  let buttonEl = document.getElementById(targetID),
      iconEl = document.createElement('img');

  buttonEl.classList.remove('button-no-show');
  buttonEl.classList.add('button', buttonClass);
  buttonEl.setAttribute('data-action', action);
  buttonEl.innerText = text;
  iconEl.classList.add('button-icon');
  iconEl.src = iconPath;
  buttonEl.appendChild(iconEl);

  addEvents([buttonEl]);
}

function onClick(e) {
  switch (e.currentTarget.getAttribute('data-action')) {
    case 'insta-upload':

      // instaAvailable is set to true via socket when an access token is granted.
      if (!window.store.getState().instaConfig.instaAvailable) {
        // redirectURL: http://www.example.com?myclient_id=johndoe
        let redirectURL = [location.protocol, '//', location.host, location.pathname].join('') + '?myclient_id=' + window.store.getState().pageConfig.sessionID;

        // insta_step 1: Redirect to Igram to prompt user to authenticate
        // instaAppID, provided to Instagram developers, is stored on the server
        // and fetched with the initial socket connection
        // Successful authentication will redirect the browser back to the server's
        // app.get('/') with 'myclient_id' and 'code' query parameter to be parsed by the server
        window.location = 'https://api.instagram.com/oauth/authorize/?client_id=' + config.instaAppID + '&redirect_uri=' + redirectURL + '&response_type=code';
      } else {
        // insta_step 24: If an access token was granted, open Igram divs and skip to insta_step 7.
        window.socket.emit('ce:_fetchIgramData');

        document.getElementById('insta-header').style.display = 'flex';
        document.getElementById('insta-container').style.display = 'block';
        document.getElementById('nav-upload-container').classList.remove('upload-container-is-open');
        document.body.classList.add('a-nav-container-is-open');

        // animate open hamburgers
        document.getElementById('ham-line1').style.top = '35%';
        document.getElementById('ham-line3').style.top = '65%';
      };
      break;

    // insta_step 25: Use the instagram logout link in an image tag to log out.
    // http://stackoverflow.com/questions/10991753/instagram-api-user-logout
    case 'insta-logout':
      let tempImgEl = document.createElement('img');

      tempImgEl.src = 'http://instagram.com/accounts/logout/';
      tempImgEl.style.display = 'none';
      tempImgEl.style.height = '0';
      tempImgEl.style.width = '0';

      // create the logout 'image' briefly in the dom.
      document.getElementById('wrapper').appendChild(tempImgEl);
      tempImgEl.remove();

      alert('logged out');

      // insta_step 26: Remove client's access token from server
      socket.emit('ce:_removeClientAccessToken', window.store.getState().pageConfig.sessionID);

      window.store.dispatch(setInstaAvailable(false));

      break;
    default:
      break;
  };
};

function addEvents(buttons) {
  buttons.forEach(
    button => { button.addEventListener('click', onClick.bind(this)); });
}
