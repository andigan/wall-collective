import config from '../_config/config';
import stateChange from '../views/state-change';
import { setDeleteID } from '../actions';
import { setSelectedImage } from '../actions';
import { initializeImage } from '../components/images';
import { highestZ } from '../components/images';
import { shiftZsAboveXDown } from '../components/images';
import { zReport } from '../components/images';
import { setDraggerLocations } from '../components/draggers';


export function buttonsInit() {

  createButton('n1', 'open-account', 'account', '/icons/person_circle-icon.png', 'button-nav');
  createButton('n2', 'open-tools', 'tools', '/icons/tools-icon.png', 'button-nav');
  createButton('n3', 'open-upload', 'upload', '/icons/upload-icon.png', 'button-nav');
  createButton('n4', 'exit-door', 'remove', '/icons/door-icon.png', 'button-nav');

  createButton('t1', 'choose-color', 'color', '/icons/palette-icon.png', 'button-tools');
  createButton('t2', 'reset-page', 'reset page', '/icons/reset-icon.png', 'button-tools');
  createButton('t3', 'reset-image', 'reset image', '/icons/eraser-icon.png', 'button-tools');

  createButton('a1', 'app-info', 'info', '/icons/info-icon.png', 'button-tools');
  document.getElementById('u2').appendChild(document.getElementById('upload-form-button'));
  createButton('a3', 'textbox', 'textbox', '/icons/info-icon.png', 'button-tools');


  createjsColor();

  addEvents([
    document.getElementById('nav-tog-button'),
    document.getElementById('button-reject-delete'),
    document.getElementById('button-confirm-delete'),
    document.getElementById('button-reject-upload')
  ]);
  exitDoorDrop();
}


function createButton(targetID, action, text, iconPath, buttonClass) {
  let buttonEl = document.getElementById(targetID),
      iconEl = document.createElement('img');

  buttonEl.classList.remove('button-no-show');
  buttonEl.classList.add('button', buttonClass);
  buttonEl.setAttribute('data-action', action);
  buttonEl.innerText = text;
  iconEl.classList.add('nav-button-icon');
  iconEl.src = iconPath;
  buttonEl.appendChild(iconEl);

  addEvents([buttonEl]);
}

function onClick(e) {
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
      stateChange.openInfo();
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

    case 'reset-image':
      let imageID = window.store.getState().selectedImage.id;

      if (imageID !== '') {
        let imageEl = document.getElementById(imageID),
            topZ = highestZ(),
            socketdata;

        // change zIndexes
        if (parseInt(imageEl.style.zIndex) < topZ) {
          shiftZsAboveXDown(imageEl.style.zIndex);
          imageEl.style.zIndex = topZ;
          window.socket.emit('ce:_changeZs', zReport());
        };

        initializeImage(imageEl);

        socketdata = {
          imageID: imageID,
          filename: imageEl.title
        };

        setDraggerLocations(imageID);

        window.socket.emit('ce:_resetImageAll', socketdata);
      }
      break;

    case 'choose-color':
      let chooserEl = document.getElementById('color-chooser'),
          chooserPos = config.chooserPos,
          wrapperEl = document.getElementById('wrapper');

      stateChange.hideDraggers();

      chooserEl.style.display = 'block';
      // set the initial location for the color
      chooserEl.jscolor.fromString(wrapperEl.style.backgroundColor);

      // position the input element; the palette box appears above and left-justified
      chooserEl.style.left = `${(parseInt(wrapperEl.style.width) / 2) - (chooserPos.width / 2)}px`;
      chooserEl.style.top = `${(parseInt(wrapperEl.style.height) / 2) + (chooserPos.height / 2)}px`;

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

    // experimental

    case 'textbox':
      let x = document.getElementById('cube');

      if (x.style.display === 'none') {
        x.style.display = 'block';
      } else {
        x.style.display = 'none';
      };
      break;


    case 'open-explore':
      document.getElementById('explore-container').style.display = 'block';

      document.getElementById('image-explore').src = document.getElementById(store.getState().selectedImage.id).src;

      if (document.getElementById(store.getState().selectedImage.id).getAttribute('data-link').length > 1) {

        document.getElementById('igram-link').setAttribute('href', document.getElementById(store.getState().selectedImage.id).getAttribute('data-link'));
      };


      if ( (typeof store.getState().selectedImage.id !== 'undefined') && (store.getState().selectedImage.id.length > 0 ) ) {

        // if selected file is empty, fill it.

      } else {
      };
      break;
    default:
      break;
  }
}

function addEvents(buttons) {
  buttons.forEach(
    button => { button.addEventListener('click', onClick.bind(this)); });
}

function createjsColor() {
  let jscolorEl,
      chooserPos = config.chooserPos,
      wrapperEl = document.getElementById('wrapper');


  // fires rapidly when dragging on palette box
  window.jScOlOrUpdate = function (jscolor) {
    wrapperEl.style.backgroundColor = `#${jscolor}`;
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

  jscolorEl.setAttribute('data-jscolor', `{position: 'top', mode:'HVS', width:${chooserPos.width}, height:${chooserPos.height}, padding:0, shadow:false, borderWidth:0, backgroundColor:'transparent', insetColor:'#000', onFineChange: 'window.jScOlOrUpdate(this)'}`);
  jscolorEl.setAttribute('onchange', 'window.jScOlOrChoice(this.jscolor)');

  wrapperEl.appendChild(jscolorEl);
}

function exitDoorDrop() {

  $('#n4').droppable({
    accept: '.wallPic',
    // activeClass: 'exit_active_class',
    hoverClass: 'exit-door-hover',
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
