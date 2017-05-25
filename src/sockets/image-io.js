import { assignImageDrag } from '../components/ui-elements/main-image-drag';
import { initializeImage } from '../components/images';
import { setSelectedImage } from '../actions';
import stateChange from '../views/state-change';

export default function (socket) {
  socket.on('bc:_moving', function (data) {
    document.getElementById(data.imageID).style.top  = data.posTop + '%';
    document.getElementById(data.imageID).style.left = data.posLeft + '%';
  });

  socket.on('bc:_resizing', function (data) {
    document.getElementById(data.imageID).style.transform = data.transform;
    document.getElementById(data.imageID).style.top = data.imageTop;
    document.getElementById(data.imageID).style.left = data.imageLeft;
    document.getElementById(data.imageID).style.width = data.imageWidth;
    document.getElementById(data.imageID).style.height = data.imageHeight;
  });

  socket.on('bc:_resized', function (data) {
    document.getElementById(data.imageID).style.transform = data.transform;
    document.getElementById(data.imageID).style.top = data.imageTop;
    document.getElementById(data.imageID).style.left = data.imageLeft;
    document.getElementById(data.imageID).style.width = data.imageWidth;
    document.getElementById(data.imageID).style.height = data.imageHeight;
  });

  socket.on('bc:_transforming', function (data) {
    document.getElementById(data.imageID).style.transform = data.transform;
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
    document.getElementById(data.imageID).style.WebkitFilter = data.filter;
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

  socket.on('bc:_changeZs', function (zReport) {
    zReport.forEach(function (image) {
      document.getElementById(image.id).style.zIndex = image.zIndex;
    });
  });

  socket.on('bc:_resetImage', function (data) {
//    document.getElementById(data.imageID).style.zIndex = data.zIndex;
    initializeImage(document.getElementById(data.imageID));

    if (data.imageID === window.store.getState().selectedImage.id) {
      stateChange.hideDraggers();
    };
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
};
