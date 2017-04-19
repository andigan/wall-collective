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
    console.log(e.currentTarget);
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
        stateChange.hideElement(selectedImage);
        // hide draggers
        stateChange.hideDraggers();
        // show delete_preview_container
        stateChange.deletePreview();
        this.handleDelete();
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
      window.socket.emit('c-e:  hide_image', selectedImageID);
    };
  },

  addEvents() {
    this.buttons.forEach(
      button => { button.addEventListener('click', this.onClick.bind(this)); });
  }




};
