import igConfig from './config';
import stateChange from '../views/state-change';
import pageSettings from '../_init/page-settings';

import { assignImageDrag } from '../components/ui-elements/main-image-drag';

import { setHasIgramToken } from './actions';

export function igramIOInit(socket) {

  // igram-#1: Store igramAppID from server
  socket.on('se:_setIgramAppID', function (appId) {
    igConfig.appId = appId;
  });

  // igram-#21: Sent from the server on initial socket when an access token
  // already exists for the session.
  socket.on('se:_HasIgramToken', function () {
    window.store.dispatch(setHasIgramToken(true));
  });

  // used to see instagram results (-#10)
  socket.on('be:_checkOut', function (data) {
    console.log(data);
  });

  // igram-#11: Add content to igram-container
  socket.on('se:_addContentToIgramDiv', function (igramResponse) {
    var instaImagesEl = document.getElementById('igram-images-container');

    // set content in igram-header
    document.getElementById('igram-info-username').textContent = igramResponse.username;
    document.getElementById('igram-profile-image').src = igramResponse.profilePic;
    document.getElementById('insta-profile-link').setAttribute('href', 'https://www.instagram.com/' + igramResponse.username + '/?hl=en');

    // destroy current images in igram-images-container
    instaImagesEl.innerHTML = '';

    igramResponse.images.forEach(function (image, i, images) {

      let tempImg = document.createElement('img'),
          tempEl = document.createElement('div'),
          spacerTop = document.createElement('div'),
          spacerMiddle = document.createElement('div'),
          spacerBottom = document.createElement('div');

      tempEl.classList.add('igram-image-container');

      tempImg.setAttribute('id', 'insta' + i);
      tempImg.classList.add('igram-image');
      tempImg.src = image.url;
      tempImg.setAttribute('data-link', image.pageLink);

      spacerTop.classList.add('igram-spacer-topbottom');
      spacerMiddle.classList.add('igram-spacer-middle');
      spacerBottom.classList.add('igram-spacer-topbottom');

      tempEl.appendChild(tempImg);
      instaImagesEl.appendChild(tempEl);

      // add spacers for scrolling
      if (i < images.length - 1) {
        instaImagesEl.appendChild(spacerTop);
        instaImagesEl.appendChild(spacerMiddle);
        instaImagesEl.appendChild(spacerBottom);
      };

      // igram-#12: Make the imported images draggable
      // use a clone so that the images can escape the scrollable div
      $('#insta' + i).draggable(
        { helper: 'clone',
          appendTo: 'body',
          scroll: true,
          start:  function () {

            // assign temporary z-index
            this.style.zIndex = 60000;

            stateChange.hideDraggers();
          }
        });
    });
  });

// igram-#13: Make dragged igram-images droppable in images div
// http://stackoverflow.com/questions/36181050/jquery-ui-draggable-and-droppable-duplicate-issue
// This allows the image to be draggable outside of the scrollable div
  $('#images').droppable({
    accept: '.igram-image',
    drop: function (event, ui) {
      var clone = {},
          dropData = {};

      // clone is a jQuery method.  false specifies that event handlers should not be copied.
      // create a clone of the ui.draggable within the images div
      clone = ui.draggable.clone(false);

      dropData.left = ((ui.offset.left - (pageSettings.mainWide - pageSettings.imagesWide) / 2) / pageSettings.imagesWide * 100).toFixed(2) + '%';
      dropData.top = ((ui.offset.top - (pageSettings.mainHigh - pageSettings.imagesHigh) / 2) / pageSettings.imagesHigh * 100).toFixed(2) + '%';

      clone.css('left', dropData.left)
           .css('top', dropData.top)
           .css('position', 'absolute')
           // consider changing id so that id is not duplicated in dom
           // .attr('id', 'i' + clone.attr('id')),
           .removeClass('ui-draggable ui-draggable-dragging resize-drag');
      $('#images').append(clone);


      // igram-#14: Send info to server for storing and sharing
      dropData.imageID = ui.draggable[0].getAttribute('id');
      dropData.src = ui.draggable[0].src;
      dropData.owner = window.store.getState().pageConfig.sessionID;
      dropData.width = (parseFloat(window.getComputedStyle(ui.draggable[0]).width) / pageSettings.imagesWide * 100).toFixed(2) + '%';
      dropData.height = (parseFloat(window.getComputedStyle(ui.draggable[0]).height) / pageSettings.imagesHigh * 100).toFixed(2) + '%';

      dropData.link = ui.draggable[0].getAttribute('data-link');

      socket.emit('ce:_igramDrop', dropData); // (-#15)
    }
  });

  // igram-#17: Convert dragged igram image to typical .wallPic
  socket.on('se:_changeCloneToImage', function (dbDropData) {
    var imageEl = document.getElementById(dbDropData.iID);

    imageEl.setAttribute('id', dbDropData.dom_id);
    imageEl.src = dbDropData.src;
    imageEl.classList.add('wallPic');

    imageEl.style.left = dbDropData.left;
    imageEl.style.top = dbDropData.top;
    imageEl.style.width = dbDropData.width;
    imageEl.style.height = dbDropData.height;

    imageEl.classList.remove('igram-image');
    imageEl.setAttribute('title', dbDropData.filename);
    imageEl.setAttribute('data-link', dbDropData.link);
    imageEl.setAttribute('data-scale', '1');
    imageEl.setAttribute('data-angle', '0');
    imageEl.setAttribute('data-rotateX', '0');
    imageEl.setAttribute('data-rotateY', '0');
    imageEl.setAttribute('data-rotateZ', '0');
    imageEl.style.zIndex = dbDropData.z_index;
    imageEl.style.opacity = 1;
    imageEl.style.WebkitFilter = 'grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)';
    imageEl.style.transform = 'rotate(0deg) scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg)';

    // assign drag to added element
    assignImageDrag(dbDropData.dom_id);
  });

  // igram-#19: Add image to other clients
  socket.on('be:_addIgramImageToOtherClients', function (dbDropData) {
    var imagesEl = document.getElementById('images'),
        imageEl = document.createElement('img');

    imageEl.setAttribute('id', dbDropData.dom_id);
    imageEl.setAttribute('title', dbDropData.filename);
    imageEl.src = dbDropData.src;
    imageEl.classList.add('wallPic');
    imageEl.style.width = dbDropData.width;
    imageEl.style.height = dbDropData.height;
    imageEl.style.top = dbDropData.top;
    imageEl.style.left = dbDropData.left;
    imageEl.style.zIndex = dbDropData.z_index;
    imageEl.setAttribute('data-link', dbDropData.link);

    imageEl.setAttribute('data-scale', '1');
    imageEl.setAttribute('data-angle', '0');
    imageEl.setAttribute('data-rotateX', '0');
    imageEl.setAttribute('data-rotateY', '0');
    imageEl.setAttribute('data-rotateZ', '0');
    imageEl.style.opacity = 1;
    imageEl.style.WebkitFilter = 'grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)';
    imageEl.style.transform = 'rotate(0deg) scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg)';

    imagesEl.appendChild(imageEl);

    // assign drag to added element
    assignImageDrag(dbDropData.dom_id);
  });

}
