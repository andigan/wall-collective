import stateChange from '../views/state-change';
// import socketFile from '../socket-file';
import { setDeleteTarget } from '../actions';

module.exports = {

  init(config) {
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
    // this.createButton('t3', 'explore', 'explore', '/icons/magnifying_glass_icon.png', 'button-tools');

    this.createButton('a1', 'app-info', 'info', '/icons/info_icon.png', 'button-tools');
    this.createButton('a2', 'insta-logout', 'instagram logout', '/icons/debug_icon.png', 'button-tools');

    document.getElementById('u2').appendChild(document.getElementById('upload-form-button'));
    this.createButton('u3', 'insta-upload', 'Instagram', '/icons/glyph-logo_May2016.png', 'button-tools');

    this.createjsColor();

    this.addEvents();
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
        document.getElementById('app_info').style.display = 'block';
        document.getElementById('close_info_container').style.display = 'block';
        break;

      case 'exit-door':
        // hide original image
        stateChange.hideID(window.store.getState().selectedImage.id);
        // set delete target in store
        store.dispatch(setDeleteTarget(document.getElementById(window.store.getState().selectedImage.id)));

        stateChange.hideDraggers();
        stateChange.deletePreview();
        this.handleDelete();
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

      default:
        break;
    }
  },

  handleDelete() {
    var selectedImageID = window.store.getState().selectedImage.id,
        selectedImage = document.getElementById(selectedImageID);

    if (selectedImageID !== '') {
      window.store.dispatch(setDeleteTarget(selectedImage));

      // send socket to hide on other clients
      window.socket.emit('ce:_hideImage', selectedImageID);
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
  }
};
