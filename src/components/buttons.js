import config from '../_config/config';
import stateChange from '../views/state-change';
// import socketFile from '../socket-file';
import { setDeleteID } from '../actions';
import { setSelectedImage } from '../actions';
// IGRAM-OPTION
import { setInstaAvailable} from '../actions';

module.exports = {

  init() {
    this.chooserPos = config.chooserPos;

    this.wrapperEl = document.getElementById('wrapper');

    this.buttons = [];
    this.createButton('n1', 'open-account', 'account', '/icons/person_circle_icon.png', 'button-nav');
    this.createButton('n2', 'open-tools', 'tools', '/icons/tools_icon.png', 'button-nav');
    this.createButton('n3', 'open-upload', 'upload', '/icons/upload_icon.png', 'button-nav');
    this.createButton('n4', 'exit-door', 'remove', '/icons/door_icon.png', 'button-nav');

    this.createButton('t1', 'dragger-switch', 'draggers', '/icons/draggers_icon.png', 'button-tools');
    this.createButton('t2', 'choose-color', 'color', '/icons/palette_icon.png', 'button-tools');
    this.createButton('t3', 'reset-page', 'reset page', '/icons/reset_icon.png', 'button-tools');
//    this.createButton('t4', 'open-explore', 'explore', '/icons/magnifying_glass_icon.png', 'button-tools');

    this.createButton('a1', 'app-info', 'info', '/icons/info_icon.png', 'button-tools');
    document.getElementById('u2').appendChild(document.getElementById('upload-form-button'));

    // IGRAM-OPTION
    if (config.useIGram) {
      this.createButton('a2', 'insta-logout', 'instagram logout', '/icons/debug_icon.png', 'button-tools');
      this.createButton('u3', 'insta-upload', 'Instagram', '/icons/glyph-logo_May2016.png', 'button-tools');
    };

    this.createjsColor();

    this.buttons.push(document.getElementById('nav-tog-button'));
    this.buttons.push(document.getElementById('button-reject-delete'));
    this.buttons.push(document.getElementById('button-confirm-delete'));
    this.buttons.push(document.getElementById('x-info-container'));
    this.buttons.push(document.getElementById('button-reject-upload'));
    this.buttons.push(document.getElementById('x-explore-container'));

    this.addEvents();
    this.exitDoorDrop();

  },

  createButton(targetID, action, text, iconPath, buttonClass) {
    var buttonEl = document.getElementById(targetID),
        iconEl = document.createElement('img');

    buttonEl.classList.remove('button-no-show');
    buttonEl.classList.add('button', buttonClass);
    buttonEl.setAttribute('data-action', action);
    buttonEl.innerText = text;
    iconEl.classList.add('button-icon');
    iconEl.src = iconPath;
    buttonEl.appendChild(iconEl);

    this.buttons.push(buttonEl);
  },

  onClick(e) {
    switch (e.currentTarget.getAttribute('data-action')) {
      case 'main-nav-click':
        let navMainEl = document.getElementById('nav-tog-button');

        // if the main button is not being dragged, process the click.
        if ( navMainEl.classList.contains('nav-tog-dragging') === false ) {

          // if any containers are open
          if ( document.body.classList.contains('a-nav-container-is-open') ) {
            // close all containers
            stateChange.closeAll();

            // if an image is selected
            if ( store.getState().selectedImage.id !== '' ) {
              // restore selected image in case it was removed by being dragged onto the exit door
              document.getElementById(store.getState().selectedImage.id).style.display = 'initial';
            };
          // else when no containers are open
          } else {
            // open the navigation container
            document.getElementById('nav-main-container').classList.add('nav-is-open');
            document.body.classList.add('a-nav-container-is-open');
            document.getElementById('connect-info').classList.add('connect-info-is-open');

            // animate open hamburgers
            document.getElementById('ham-line1').style.top = '35%';
            document.getElementById('ham-line3').style.top = '65%';

            stateChange.hideDraggers();
          };
        };
        break;

      case 'open-tools':
        stateChange.openTools();
        // NOTES: this.store.dispatch(open-tools())
        break;

      case 'open-account':
        stateChange.openAccount();
        break;

      case 'open-upload':
        stateChange.openUpload();
        break;

      case 'app-info':
        document.getElementById('info-page').style.display = 'block';
        document.getElementById('x-info-container').style.display = 'block';
        break;

      case 'exit-door':
        // hide original image
        if (window.store.getState().selectedImage.id !== '') {
          let deleteID = window.store.getState().selectedImage.id;

          window.store.dispatch(setDeleteID(deleteID));

          stateChange.hideID(deleteID);
          stateChange.hideDraggers();
          stateChange.deletePreview(deleteID);
          window.socket.emit('ce:_hideImage', deleteID);
        };
        break;

      case 'dragger-switch':
        let switchesEl = document.getElementById('d-switches-container');

        switchesEl.classList.toggle('d-switches-is-open');
        // if dragger_switches container opens, close navigation container
        if (switchesEl.classList.contains('d-switches-is-open')) {
          document.getElementById('nav-main-container').classList.remove('nav-is-open');
        };
        break;

      case 'reset-page':
        let xhr = new XMLHttpRequest ();

        xhr.open('GET', '/resetpage');
        xhr.send(null);

        window.socket.emit('ce:_saveBackground', '#000000');

        xhr.onreadystatechange = function () {
          // readyState 4: request is done.
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              // send socket to reset other pages
              window.socket.emit('ce:_resetPage');
              // reload the page
              window.location.assign([location.protocol, '//', location.host, location.pathname].join(''));
            } else {
              console.log('Error: ' + xhr.status);
            };
          }
        };
        break;

      case 'choose-color':
        let chooserEl = document.getElementById('color-chooser');

        chooserEl.style.display = 'block';
        // set the initial location for the color
        chooserEl.jscolor.fromString(this.wrapperEl.style.backgroundColor);

        // position the input element; the palette box appears above and left-justified
        chooserEl.style.left = `${(parseInt(this.wrapperEl.style.width) / 2) - (this.chooserPos.width / 2)}px`;
        chooserEl.style.top = `${(parseInt(this.wrapperEl.style.height) / 2) + (this.chooserPos.height / 2)}px`;

        chooserEl.jscolor.show();
        break;

      case 'delete-reject':
        stateChange.rejectDelete();
        window.socket.emit('ce:_showImage', window.store.getState().pageConfig.deleteID);
        break;

      case 'delete-confirm':
        let socketdata = {},
            deleteID = window.store.getState().pageConfig.deleteID;

        // prepare socket data
        socketdata.filenameToDelete = document.getElementById(deleteID).getAttribute('title');
        socketdata.deleteID = deleteID;

        // remove element
        document.getElementById(deleteID).remove();

        stateChange.afterDelete();

        // reset store
        store.dispatch(setSelectedImage(''));
        store.dispatch(setDeleteID(''));

        // send data to server to delete image
        socket.emit('ce:_deleteImage', socketdata);
        break;

      case 'upload-reject':
        stateChange.afterUpload();
        break;

      case 'close-info-page':
        stateChange.hideID('info-page');
        stateChange.hideID('x-info-container');
        break;


      // explore to fix
      case 'open-explore':
        document.getElementById('explore-container').style.display = 'block';
        document.getElementById('x-explore-container').style.display = 'block';

        document.getElementById('image-explore').src = document.getElementById(store.getState().selectedImage.id).src;

        if (document.getElementById(store.getState().selectedImage.id).getAttribute('data-link').length > 1) {

          document.getElementById('insta_link').setAttribute('href', document.getElementById(store.getState().selectedImage.id).getAttribute('data-link'));
        };


        if ( (typeof store.getState().selectedImage.id !== 'undefined') && (store.getState().selectedImage.id.length > 0 ) ) {

          // if selected file is empty, fill it.

        } else {
        };
        break;

      case 'close-explore':
        stateChange.hideID('explore-container');
        stateChange.hideID('x-explore-container');
        break;

      default:
        break;
    }

    // IGRAM-OPTION
    if (config.useIGram) {
      switch (e.currentTarget.getAttribute('data-action')) {
        case 'insta-upload':

          // instaAvailable is set to true via socket when an access token is granted.
          if (!window.store.getState().pageConfig.instaAvailable) {
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
          var tempImgEl = document.createElement('img');

          tempImgEl.src = 'http://instagram.com/accounts/logout/';
          tempImgEl.style.display = 'none';
          tempImgEl.style.height = '0';
          tempImgEl.style.width = '0';

          // create the logout 'image' briefly in the dom.
          document.getElementById('wrapper').appendChild(tempImgEl);
          tempImgEl.remove();

          alert('logged out');

          // insta_step 26: Remove client's access token from server
          socket.emit('ce: remove_client_from_clients_access', window.store.getState().pageConfig.sessionID);

          window.store.dispatch(setInstaAvailable(false));

          break;
        default:
          break;
      };
    };



  },

  addEvents() {
    this.buttons.forEach(
      button => { button.addEventListener('click', this.onClick.bind(this)); });
  },

  createjsColor() {
    var jscolorEl = {};

    // fires rapidly when dragging on palette box
    window.jScOlOrUpdate = function (jscolor) {
      this.wrapperEl.style.backgroundColor = `#${jscolor}`;
      window.socket.emit('ce:_changeBackground', `#${jscolor}`);
    }.bind(this);

    // fires on mouseup
    window.jScOlOrChoice = function (jscolor) {
      window.socket.emit('ce:_saveBackground', `#${jscolor}`);
    };

    jscolorEl = document.createElement('input');
    jscolorEl.id = 'color-chooser';
    jscolorEl.classList.add('jscolor');

    jscolorEl.style.display = 'none';
    jscolorEl.style.position = 'fixed';
    jscolorEl.style.width = '1px';
    jscolorEl.style.height = '1px';
    jscolorEl.style.opacity = '0';

    jscolorEl.setAttribute('data-jscolor', `{position: 'top', mode:'HVS', width:${this.chooserPos.width}, height:${this.chooserPos.height}, padding:0, shadow:false, borderWidth:0, backgroundColor:'transparent', insetColor:'#000', onFineChange: 'window.jScOlOrUpdate(this)'}`);
    jscolorEl.setAttribute('onchange', 'window.jScOlOrChoice(this.jscolor)');

    this.wrapperEl.appendChild(jscolorEl);
  },



  exitDoorDrop() {

    $('#n4').droppable({
      accept: '.wallPic',
      // activeClass: 'exit_active_class',
      hoverClass: 'exit_door_hover',
      tolerance: 'pointer',

      over: function () { /* console.log('over exit door'); */ },
      out: function () { /* console.log('back out over exit door '); */ },
      drop: function (event, ui) {
        let deleteID = ui.draggable[0].id;

        window.store.dispatch(setDeleteID(deleteID));

        stateChange.hideID(deleteID);
        stateChange.hideDraggers();
        stateChange.deletePreview(deleteID);
        window.socket.emit('ce:_hideImage', deleteID);
      }
    });
  }

};
