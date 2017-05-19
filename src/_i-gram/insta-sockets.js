import config from '../_config/config';
import stateChange from '../views/state-change';
import pageSettings from '../_init/page-settings';

import { assignImageDrag } from '../components/ui-elements/main-image-drag';

import { setInstaAvailable } from './actions';
import { setInstaFilename } from './actions';
import { deleteInstaFilename } from './actions';

export function IOInstaInit(socket) {

  // initial set up for all visits.
  socket.on('connect:_setClientVars', function (clientVars) {
    config.instaAppID = clientVars.instaAppID;
  });

  // insta_step 23.5: if the user has an access token associated with session
  socket.on('be:_instaTokenReady', function () {
    window.store.dispatch(setInstaAvailable(true));
  });

  // used to see instagram results
  socket.on('be:_checkOut', function (data) {
    console.log(data);
  });

  // insta_step 10: Add content to insta-container
  socket.on('se:_addContentToInstaDiv', function (instaFetchData) {
    var i = 0,
        instaImagesEl = document.getElementById('insta-images-container');

    // set content in insta-header
    document.getElementById('insta-info-username').textContent = instaFetchData.username;
    document.getElementById('insta-image-profile').src = instaFetchData.profile_picture;
    document.getElementById('insta-profile-link').setAttribute('href', 'https://www.instagram.com/' + instaFetchData.username + '/?hl=en');

    // destroy current images in insta-images-container
    instaImagesEl.innerHTML = '';

    // use insta_images_src to display fetched images
    for (i = 0; i < instaFetchData.insta_images_src.length; i++ ) {

      let tempImg = document.createElement('img'),
          tempEl = document.createElement('div'),
          spacerTop = document.createElement('div'),
          spacerMiddle = document.createElement('div'),
          spacerBottom = document.createElement('div');

      tempEl.classList.add('insta-image-div');

      tempImg.setAttribute('id', 'insta' + i);
      tempImg.classList.add('insta_image');
      tempImg.src = instaFetchData.insta_images_src[i];
      tempImg.setAttribute('data-link', instaFetchData.insta_images_link[i]);

      spacerTop.classList.add('spacer-top-bottom');
      spacerMiddle.classList.add('spacer-middle');
      spacerBottom.classList.add('spacer-top-bottom');

      tempEl.appendChild(tempImg);
      instaImagesEl.appendChild(tempEl);

      // add spacers for scrolling
      if (i < instaFetchData.insta_images_src.length - 1) {
        instaImagesEl.appendChild(spacerTop);
        instaImagesEl.appendChild(spacerMiddle);
        instaImagesEl.appendChild(spacerBottom);
      };

      // insta_step 11: Make the imported images draggable

      // use a clone so that the images can escape the scrollable div
      $('#insta' + i).draggable(
        { helper: 'clone',
          appendTo: 'body',
          scroll: true,
          start:  function () {
            // insta_step 12: When dragging starts,
            // save dragged image to server storage, using id as an index
            window.socket.emit('ce:_saveInstaImage', { src: this.getAttribute('src'), id: parseInt(this.getAttribute('id').replace('insta', '')) });

            // assign temporary z-index
            this.style.zIndex = 60000;

            stateChange.hideDraggers();
          }
        });
    };
  });


  // insta_step 15: Receive new filename from server
  socket.on('ce:_instaDownloadReady', function (newFileData) {

    //  store new filename in an object with the id as the key
    let newNewFileData = {};

    newNewFileData['insta' + newFileData.iIndex] = newFileData.newFilename;
    window.store.dispatch(setInstaFilename(newNewFileData));

    console.log(newFileData.newFilename + ' downloaded.');
  });


// insta_step 16: Make dragged insta_image droppable in images_div

// http://stackoverflow.com/questions/36181050/jquery-ui-draggable-and-droppable-duplicate-issue
// This allows the image to be draggable outside of the scrollable div
  $('#images').droppable({
    accept: '.insta_image',
    drop: function (event, ui) {
      var clone = {},
          instaDropData = {},
          timeout_counter = 0;

      // clone is a jQuery method.  false specifies that event handlers should not be copied.
      // create a clone of the ui.draggable within the images div
      instaDropData.posLeft = ((ui.offset.left - (pageSettings.mainWide - pageSettings.imagesWide) / 2) / pageSettings.imagesWide * 100).toFixed(2) + '%';
      instaDropData.posTop = ((ui.offset.top - (pageSettings.mainHigh - pageSettings.imagesHigh) / 2) / pageSettings.imagesHigh * 100).toFixed(2) + '%';

      clone = ui.draggable.clone(false);
      clone.css('left', instaDropData.posLeft)
           .css('top', instaDropData.posTop)
           .css('position', 'absolute')
           // consider changing id so that id is not duplicated in dom
           // .attr('id', 'i' + clone.attr('id')),
           .removeClass('ui-draggable ui-draggable-dragging resize-drag');
      $('#images').append(clone);

      // wait for the filename to be received from the server
      function wait_for_download() {
        if (window.store.getState().instaConfig.instaFilename[ui.draggable[0].getAttribute('id')] === undefined) {

          // if timeout_counter has lasted too long, cancel operation
          timeout_counter = timeout_counter + 50;
          console.log('Waiting for download: ' + (timeout_counter / 1000) + 's');
          if (timeout_counter > 10000) {
            alert('Download error.  Refreshing page.');
            window.location.assign([location.protocol, '//', location.host, location.pathname].join(''));
          } else {
            // wait 50 milliseconds then recheck
            setTimeout(wait_for_download, 50);
            return;
          };
        };

        // once the filename is received...

        // insta_step 17: Send instaDropData to server
        instaDropData.iID = ui.draggable[0].getAttribute('id');

        instaDropData.iFilename =  window.store.getState().instaConfig.instaFilename[ui.draggable[0].getAttribute('id')];

        instaDropData.posLeft = ((ui.offset.left - (pageSettings.mainWide - pageSettings.imagesWide) / 2) / pageSettings.imagesWide * 100).toFixed(2) + '%';
        instaDropData.posTop = ((ui.offset.top - (pageSettings.mainHigh - pageSettings.imagesHigh) / 2) / pageSettings.imagesHigh * 100).toFixed(2) + '%';

        instaDropData.iWidth = window.getComputedStyle(ui.draggable[0]).width + '%';
        instaDropData.iHeight = window.getComputedStyle(ui.draggable[0]).height + '%';

        instaDropData.iwide = (parseFloat(window.getComputedStyle(ui.draggable[0]).width) / pageSettings.imagesWide * 100).toFixed(2) + '%';
        instaDropData.ihigh = (parseFloat(window.getComputedStyle(ui.draggable[0]).height) / pageSettings.imagesHigh * 100).toFixed(2) + '%';

        instaDropData.iLink = ui.draggable[0].getAttribute('data-link');

        socket.emit('ce:_instaDrop', instaDropData);

        // delete id key from insta_download_ready_filename object
        window.store.dispatch(deleteInstaFilename(ui.draggable[0].getAttribute('id')));
      }

      wait_for_download();

      // It would be much less complex to initiate the download here,
      // however, this strategy (of starting the download when the drag starts)
      // provides a quicker user experience.
    }
  });

  // insta_step 20: Convert dragged image to typical .wallPic
  socket.on('se:_changeCloneToImage', function (instaDBData) {
    var imageEl = document.getElementById(instaDBData.iID);

    imageEl.setAttribute('id', instaDBData.dom_id);
    imageEl.src = instaDBData.location + instaDBData.iFilename;
    imageEl.classList.add('wallPic');

    imageEl.style.left = instaDBData.posleft;
    imageEl.style.top = instaDBData.postop;
    imageEl.style.width = instaDBData.width;
    imageEl.style.height = instaDBData.height;

    imageEl.classList.remove('insta_image');
    imageEl.setAttribute('title', instaDBData.iFilename);
    imageEl.setAttribute('data-link', instaDBData.insta_link);
    imageEl.setAttribute('data-scale', '1');
    imageEl.setAttribute('data-angle', '0');
    imageEl.setAttribute('data-rotateX', '0');
    imageEl.setAttribute('data-rotateY', '0');
    imageEl.setAttribute('data-rotateZ', '0');
    imageEl.style.zIndex = instaDBData.z_index;
    imageEl.style.opacity = 1;
    imageEl.style.WebkitFilter = 'grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)';
    imageEl.style.transform = 'rotate(0deg) scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg)';

    // assign drag to added element
    assignImageDrag(instaDBData.dom_id);
  });

  // insta_step 22: Add image to other clients
  socket.on('be:_addInstaImageToOtherClients', function (instaDBData) {
    var imagesEl = document.getElementById('images'),
        imageEl = document.createElement('img');

    imageEl.setAttribute('id', instaDBData.dom_id);
    imageEl.setAttribute('title', instaDBData.iFilename);
    imageEl.src = instaDBData.location + instaDBData.iFilename;
    imageEl.classList.add('wallPic');
    imageEl.style.width = instaDBData.width;
    imageEl.style.height = instaDBData.height;
    imageEl.style.top = instaDBData.postop;
    imageEl.style.left = instaDBData.posleft;
    imageEl.style.zIndex = instaDBData.z_index;
    imageEl.setAttribute('data-link', instaDBData.insta_link);

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
    assignImageDrag(instaDBData.dom_id);
  });

}
