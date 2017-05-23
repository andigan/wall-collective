import config from '../_config/config';

import { getCookie } from '../helpers';
import { setCookie } from '../helpers';

import { assignImageDrag } from '../components/ui-elements/main-image-drag';
import { setSessionID } from '../actions';
import { initializeImage } from '../components/images';


export function IOInit() {
  // set socket location
  // io.connect('http://localhost:8000'); || io.connect('http://www.domain_name.com');
  let socket = io.connect([location.protocol, '//', location.host, location.pathname].join(''));

  initialSockets(socket);
  viewSockets(socket);
  imageSockets(socket);

  return socket;
}

function initialSockets(socket) {
  // on initial connect, retrieve sessionID cookie and send results to server
  socket.on('connect', function () {
    socket.emit ('ce:_sendSessionID', { sessionID: getCookie('sessionID')});
  });

  // initial set up for all visits.
  socket.on('connect:_setClientVars', function (clientVars) {

    // assign sessionID.  used by upload_counter and user_count
    // the server sends a unique id or the previous id from the cookie
    window.store.dispatch(setSessionID(clientVars.sessionID));

    // set background color
    document.getElementById('wrapper').style.backgroundColor = clientVars.backgroundColor;

    // set or reset sessionID cookie
    setCookie('sessionID', clientVars.sessionID, 7);

    // hack: Problem:  busboy stream received the file stream before the sessionID
    //                 which was passed as a data value in the xml submit
    //       Solution: change the HTML 'name' attribute of the form's input to the sessionID
    //                 which always arrives concurrently
    document.getElementById('fileselect').setAttribute('name', clientVars.sessionID);
  });
}

function viewSockets(socket) {
  // display the number of connected clients
  socket.on('bc:_changeConnectedClients', function (clients) {
    document.getElementById('connect-info').innerHTML = clients.reduce(function (str, client) {
      return str + `<img id='${client}' src='icons/person-icon.png' class='icon-person' />`;
    }, '');
  });
}

function imageSockets(socket) {

  socket.on('bc:_moving', function (data) {
    document.getElementById(data.imageID).style.top  = data.posTop + '%';
    document.getElementById(data.imageID).style.left = data.posLeft + '%';
  });

  socket.on('bc:_resizing', function (data) {
    document.getElementById(data.imageID).style.transform = data.imageTransform;
    document.getElementById(data.imageID).style.top = data.imageTop;
    document.getElementById(data.imageID).style.left = data.imageLeft;
    document.getElementById(data.imageID).style.width = data.imageWidth;
    document.getElementById(data.imageID).style.height = data.imageHeight;
  });

  socket.on('bc:_resized', function (data) {
    document.getElementById(data.imageID).style.transform = data.imageTransform;
    document.getElementById(data.imageID).style.top = data.imageTop;
    document.getElementById(data.imageID).style.left = data.imageLeft;
    document.getElementById(data.imageID).style.width = data.imageWidth;
    document.getElementById(data.imageID).style.height = data.imageHeight;
  });

  socket.on('bc:_transforming', function (data) {
    document.getElementById(data.imageID).style.transform = data.imageTransform;
  });

  // on transform changes, modify data attributes used by setDraggerLocations
  socket.on('bc:_changeDataAttributes', function (data) {
    document.getElementById(data.imageID).setAttribute('data-scale', data.scale);
    document.getElementById(data.imageID).setAttribute('data-angle', data.angle);
    document.getElementById(data.imageID).setAttribute('data-rotateX', data.rotateX);
    document.getElementById(data.imageID).setAttribute('data-rotateY', data.rotateY);
    document.getElementById(data.imageID).setAttribute('data-rotateZ', data.rotateZ);
  });

  socket.on('bc:_opacityChanging', function (data) {
    document.getElementById(data.imageID).style.opacity = data.imageOpacity;
  });

  // on filter changing, adjust target
  socket.on('bc:_filterChanging', function (data) {
    document.getElementById(data.imageID).style.WebkitFilter = data.imageFilter;
  });

  socket.on('bc:_changeBackground', function (color) {
    document.getElementById('images').style.backgroundColor = color;
  });

  // reset page across all clients
  socket.on('bc:_resetPage', function () {
    window.location.reload(true);
  });

  // remove deleted image
  socket.on('bc:_deleteImage', function (data) {
    document.getElementById(data.deleteID).remove();
    if (data.deleteID === window.store.getState().selectedImage.id) {
      window.store.dispatch(setSelectedImage(''));
      stateChange.hideDraggers();
    };
  });

  // remove filter
  socket.on('bc:_removeFilter', function (data) {
    document.getElementById(data).setAttribute('data-filter', document.getElementById(data).style.WebkitFilter);
    document.getElementById(data).style.WebkitFilter = '';
  });
  // replace filter
  socket.on('bc:_restoreFilter', function (data) {
    document.getElementById(data).style.WebkitFilter = document.getElementById(data).getAttribute('data-filter');
    document.getElementById(data).removeAttribute('data-filter');
  });

  // hide element; other client has primed image for deletion
  socket.on('bc:_hideImage', function (data) {
    document.getElementById(data).style.display = 'none';
  });
  // show element; other client has cancelled deletion
  socket.on('bc:_showImage', function (data) {
    document.getElementById(data).style.display = 'initial';
  });

  // disable dragging; other client is moving image
  socket.on('bc:_lockID', function (data) {
    $('#' + data).draggable ( 'disable' );
  });
  // enable dragging; other client has stopped moving image
  socket.on('bc:_unlockID', function (data) {
    $('#' + data).draggable ( 'enable' );
  });

  socket.on('bc:_resetImage', function (data) {
    document.getElementById(data.imageID).style.zIndex = data.zIndex;
    initializeImage(document.getElementById(data.imageID));
  });

  socket.on('se:_addUploadToPage', function (newImage) {
    let imagesEl = document.getElementById('images'),
        imageEl = document.createElement('img');

    imageEl.setAttribute('id', newImage.domId);
    imageEl.src = newImage.src;
    imageEl.setAttribute('title', newImage.filename);
    imageEl.setAttribute('data-owner', newImage.owner);
    imageEl.style.zIndex = newImage.zIndex;
    imageEl.classList.add('wallPic');

    initializeImage(imageEl);

    imageEl.style.top = newImage.top;
    imageEl.style.left = newImage.left;
    imageEl.style.height = newImage.height;
    imageEl.style.width = newImage.width;


    imagesEl.appendChild(imageEl);

    assignImageDrag(newImage.domId);
  });

  // if this client is the uploader, show upload statistics from busboy
  socket.on('bc:_uploadChunkSent', function (uploaddata) {
    if (uploaddata.sessionID === window.store.getState().pageConfig.sessionID && (!!document.getElementById('fileselect').files[0])) {
      config.uploadTotal += uploaddata.chunkSize;
      document.getElementById('upload-confirm-info').textContent = 'Uploaded ' + config.uploadTotal  + ' bytes of ' + document.getElementById('fileselect').files[0].size + ' bytes.';
    };
  });
}
