import stateChange from '../views/state-change';
// import socketFile from '../socket-file';
import { setDeleteTarget } from '../actions';

module.exports = {

  init() {
    this.buttons = [];
    this.createButton('n1', 'open-account', 'account', '/icons/person_circle_icon.png');
    this.createButton('n2', 'open-tools', 'tools', '/icons/tools_icon.png');
    this.createButton('n3', 'open-upload', 'upload', '/icons/upload_icon.png');
    this.createButton('n4', 'exit-door', 'remove', '/icons/door_icon.png');

    this.createButton('t1', 'dragger-switch', 'draggers', '/icons/draggers_icon.png');
    this.createButton('t2', 'reset-page', 'reset page', '/icons/reset_icon.png');
//    this.createButton('t3', 'explore', 'explore', '/icons/magnifying_glass_icon.png');
    this.createButton('t4', 'choose-color', 'bk color', '/icons/door_icon.png');

    this.addEvents();
  },

  createButton(domLocation, action, text, iconPath) {
    var targetDiv = document.getElementById(domLocation),
        iconDiv = document.createElement('img');

    targetDiv.classList.remove('button_no_show');
    targetDiv.classList.add('button', 'navigation_button');
    targetDiv.setAttribute('data-action', action);
    targetDiv.innerText = text;
    iconDiv.classList.add('icon_image');
    iconDiv.src = iconPath;
    targetDiv.appendChild(iconDiv);

    this.buttons.push(targetDiv);
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
      case 'exit-door':
        // hide original image
        stateChange.hideID(window.store.getState().selectedImage.id);
        // set delete target in store
        store.dispatch(setDeleteTarget(document.getElementById(window.store.getState().selectedImage.id)));
        // hide draggers
        stateChange.hideDraggers();
        // show delete_preview_container
        stateChange.deletePreview();
        this.handleDelete();
        break;
      case 'dragger-switch':
        document.getElementById('dragger_switches_container').classList.toggle('dragger_switches_container_is_open');
        // if dragger_switches container opens, close navigation container
        if (document.getElementById('dragger_switches_container').classList.contains('dragger_switches_container_is_open')) {
          document.getElementById('navigation_container').classList.remove('navigation_container_is_open');
        };
        break;
      case 'reset-page':
        let xhr = new XMLHttpRequest ();
        xhr.open('GET', '/resetpage');
        xhr.send(null);

        xhr.onreadystatechange = function () {
          // readyState 4 means the request is done.
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              // send socket to reset other pages
              window.socket.emit('ce:_resetPage');
              // reload the page
              window.location.assign([location.protocol, '//', location.host, location.pathname].join(''));
            } else {
              console.log('Error: ' + xhr.status); // An error occurred during the request.
            };
          }
        };
        break;
        case 'choose-color':
          // currently does nothing
          stateChange.openColorChooser();
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
      window.socket.emit('ce:  hide_image', selectedImageID);
    };
  },

  addEvents() {
    this.buttons.forEach(
      button => { button.addEventListener('click', this.onClick.bind(this)); });
  }

};
