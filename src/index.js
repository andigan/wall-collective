// change party dragger to be opacity 100% in center
// add button to reset image
// clean dragger.js



// wall-collective
//
// Version: 0.7.0
// Requires: jQuery v1.7+
//           jquery-ui
//           jquery.form
//           jquery.mobile-events
//           jquery.ui.touch-punch
//           socket.io v1.3.7+
//           interact.js
//
// Copyright (c) 2018 Andrew Nease (andrew.nease.code@gmail.com)

import config from './_config/config';

import configureStore from './_init/configureStore';
const store = configureStore();

import pageSettings from './_init/pageSettings';
import stateChange from './views/state-change';

// components
import { buttonsInit } from './components/buttons';
import  { navToggleInit } from './components/ui-elements/nav-toggle-button';

// actions
import { setSelectedImage } from './actions';
import { setSessionID } from './actions';
import { setInstaAvailable } from './actions';
import { setSwitchesStatus } from './actions';


// helpers
import { getCookie } from './helpers';
import { setCookie } from './helpers';

// main drag
import { assignImageDrag } from './components/ui-elements/main-image-drag';

// Interact.js
import { assignImageInteract } from './components/ui-elements/main-image-interact';

// draggers
import { draggersInit } from './components/draggers';
import { dSwitchsInit } from './components/d-switchs';
import { setDraggerLocations } from './components/draggers';


// DEBUG
import debug from './debug/debug'; // DEBUG
if (config.debugOn) debug.init(store);

// instagram switch; arriving from server response
config.useIGram = useIGram;

window.store = store;





// switches_status cookie stores which draggers are activated when the page loads; capital letters denote an activated dragger
if (getCookie('switches_status') === '') setCookie('switches_status', 'SRObcgtp', 7);

switches_status = getCookie('switches_status');
window.store.dispatch(setSwitchesStatus(getCookie('switches_status')));

let switchesStatus = getCookie('switches_status');
let switches = ['stretch', 'rotation', 'opacity', 'blur_brightness', 'contrast_saturate', 'grayscale_invert', 'threeD', 'party'];


// if the switches_status character is uppercase, switch on the corresponding dragger_switch
for ( let i = 0; i < switches.length; i++ ) {
  if (switchesStatus[i] === switchesStatus[i].toUpperCase()) document.getElementById('switch-' + switches[i]).classList.add('switchon');
};






buttonsInit(); // create buttons and assign functionality
pageSettings.init(); // set page sizes and resize listeners
navToggleInit(); // make nav-toggle-button draggable
draggersInit(); // set up draggers functionality
dSwitchsInit(); // set up dragger switches



// temporary fix: change auto height to percentage
Array.from(document.getElementsByClassName('wallPic')).forEach(function (element) {
  if (element.style.height === 'auto') {
    element.style.height = ((parseInt(window.getComputedStyle(element).height) / pageSettings.imagesHigh * 100).toFixed(2)) + '%';
  };
});


// set socket location : io.connect('http://localhost:8000'); || io.connect('http://www.domain_name.com');
var socket = io.connect([location.protocol, '//', location.host, location.pathname].join('')),

    // assigned by initial socket; used by upload counter
    sessionID = String,

    // used with a cookie to store which draggers are active for individual persistence
    switches_status = String,

    // used by the upload counter
    uploadtotal = 0,

    // used when an image is dragged from the instagram div; assigned by socket when download is complete
    insta_download_ready_filename = {};

window.socket = socket;



var insta = {
  init: function () {
    // set insta-container's height
    document.getElementById('insta-container').style.height = (window.innerHeight) + 'px';
    document.getElementById('insta-images-container').style.height = (window.innerHeight * 0.8) + 'px';
    document.getElementById('insta-images-container').style.top = (window.innerHeight * 0.1) + 'px';
    document.getElementById('insta-header').style.height = (window.innerHeight * 0.07) + 'px';
    document.getElementById('background-opacity').style.height = (window.innerHeight * 0.8) + 'px';
    document.getElementById('background-opacity').style.top = (window.innerHeight * 0.1) + 'px';

    // insta_step 5, 6: on initial load, if query includes ?open_igram (added after i-gram auth),
    // fetch igram data and open the divs
    if (window.location.href.includes('open_igram')) {
      socket.emit('ce:_fetchIgramData');

      document.getElementById('insta-header').style.display = 'flex';
      document.getElementById('insta-container').style.display = 'block';
      document.body.classList.add('a-nav-container-is-open');

      // animate open hamburgers
      document.getElementById('ham-line1').style.top = '35%';
      document.getElementById('ham-line3').style.top = '65%';
    };
  }
};

// initialize instagram options
insta.init();

// assign draggable to all .wallPic elements
assignImageDrag();
assignImageInteract();

// // prevent default behavior to prevent iphone dragging and bouncing
// // http://www.quirksmode.org/mobile/default.html
// document.ontouchmove = function (event) {
//   event.preventDefault();
// };

  // process any click on the wrapper
  $('#wrapper').on('click touchstart', function (event) {
    var dragger_elements = {};

    document.getElementById('color-chooser').style.display = 'none';

    // if the images div alone is clicked...
    if (event.target.getAttribute('id') === 'images') {
      dragger_elements = document.getElementsByClassName('dragger');
      // remove all draggers
      stateChange.hideDraggers();
      // close button containers and remove d-transition
      document.body.classList.remove('d-transition');

    };
  });


  // remove
  // if (document.getElementById('insta-container').style.display === 'block') {
  //   history.replaceState({}, 'wall-collective', '/');
  //   document.getElementById('insta-header').style.display = 'none';
  //   document.getElementById('insta-container').style.display = 'none';
  // };

// --Socket.io

  // on initial connect, retrieve sessionID cookie and send results to server
  socket.on('connect', function () {
    var clientVars = {};

    clientVars.sessionID = getCookie('sessionID');
    socket.emit ('ce:  sessionID_check', clientVars);

  });


  // used to see instagram results
  socket.on('check_out', function (data) {
    console.log(data);
  });


  socket.on('ce: insta_access_ready', function () {
    window.store.dispatch(setInstaAvailable(true));
  });

  // initial set up for all visits.
  socket.on('connect_set_clientVars', function (clientVars) {
    var i = 0;

    // assign sessionID.  used by upload_counter and user_count
    // the server sends a unique id or the previous id from the cookie
    sessionID = clientVars.sessionID;
    window.store.dispatch(setSessionID(sessionID));



//    instaAppID = clientVars.instaAppID;
    config.instaAppID = clientVars.instaAppID;


    // set background color
    document.getElementById('wrapper').style.backgroundColor = clientVars.backgroundColor;

    // set or reset sessionID cookie
    setCookie('sessionID', sessionID, 7);

    // hack: Problem:  busboy stream received the file stream before the sessionID, which was passed as a data value in the ajax submit
    //       Solution: change the HTML 'name' attribute of the form's input to the sessionID, which always arrives concurrently
    document.getElementById('fileselect').setAttribute('name', sessionID);
  });

  // display the number of connected clients
  socket.on('bc: change_user_count', function (data) {
    var i = 0,
      content = '',
      connectInfoEl = document.getElementById('connect-info');

    // for each connected_client, add an icon to connect-info element
    for ( i = 0; i < data.length; i++ ) {
      content = content + "<img src='icons/person_icon.png' class='icon-person' />";
      // debug: report sessionID rather than image. underline connected sessionID
      // if (data[i] === sessionID) content = content + '<u>'; content = content + '  ' + data[i]; if (data[i] === sessionID) content = content + '</u>';
    };
    connectInfoEl.innerHTML = content;
  });

  // on another client moving an image, move target
  socket.on('bc:_moving', function (data) {
    document.getElementById(data.imageID).style.top  = data.posTop + '%';
    document.getElementById(data.imageID).style.left = data.posLeft + '%';
  });

  // on another client resizing an image, resize target
  socket.on('bc: resizing', function (data) {
    document.getElementById(data.imageID).style.transform = data.imageTransform;
    document.getElementById(data.imageID).style.top       = data.imageTop;
    document.getElementById(data.imageID).style.left      = data.imageLeft;
    document.getElementById(data.imageID).style.width     = data.imageWidth;
    document.getElementById(data.imageID).style.height    = data.imageHeight;
  });

  // on resize stop, resize target with new parameters
  socket.on('bc: resized', function (data) {
    document.getElementById(data.imageID).style.transform = data.imageTransform;
    document.getElementById(data.imageID).style.top       = data.imageTop;
    document.getElementById(data.imageID).style.left      = data.imageLeft;
    document.getElementById(data.imageID).style.width     = data.imageWidth;
    document.getElementById(data.imageID).style.height    = data.imageHeight;
  });

  // on transforming, transform target
  socket.on('bc: transforming', function (data) {
    document.getElementById(data.imageID).style.transform = data.imageTransform;
  });

  // on transform changes, modify data attributes used by setDraggerLocations
  socket.on('bc: change_data_attributes', function (data) {
    document.getElementById(data.imageID).setAttribute('data-scale', data.scale);
    document.getElementById(data.imageID).setAttribute('data-angle', data.angle);
    document.getElementById(data.imageID).setAttribute('data-rotateX', data.rotateX);
    document.getElementById(data.imageID).setAttribute('data-rotateY', data.rotateY);
    document.getElementById(data.imageID).setAttribute('data-rotateZ', data.rotateZ);
  });

  // on opacity changing, adjust target
  socket.on('bc: opacity_changing', function (data) {
    document.getElementById(data.imageID).style.opacity = data.imageOpacity;
  });

  // on filter changing, adjust target
  socket.on('bc: filter_changing', function (data) {
    document.getElementById(data.imageID).style.WebkitFilter = data.imageFilter;
  });

  socket.on('bc:_changeBackground', function (data) {
    document.getElementById('images').style.backgroundColor = data;
  });

  // reset page across all clients
  socket.on('bc: resetpage', function () {
    window.location.reload(true);
  });

  // add uploaded image
  socket.on('bc: add_upload', function (data) {
    var images_element = document.getElementById('images'),
      imageEl = document.createElement('img');

    imageEl.setAttribute('id', data.dom_id);
    imageEl.src = data.location + data.imageFilename;
    imageEl.classList.add('wallPic');
    imageEl.setAttribute('title', data.imageFilename);
    imageEl.setAttribute('data-scale', '1');
    imageEl.setAttribute('data-angle', '0');
    imageEl.setAttribute('data-rotateX', '0');
    imageEl.setAttribute('data-rotateY', '0');
    imageEl.setAttribute('data-rotateZ', '0');
    imageEl.style.width = config.uploadWidth;
    imageEl.style.zIndex = data.z_index;
    imageEl.style.top = config.uploadTop;
    imageEl.style.left = config.uploadLeft;
    imageEl.style.opacity = 1;
    imageEl.style.WebkitFilter = 'grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)';
    imageEl.style.transform = 'rotate(0deg) scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg)';

    // Add <img id='dom_id'> to <div id='images'>
    images_element.appendChild(imageEl);
    // assign drag to added element
    assignImageDrag(data.dom_id);
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
  socket.on('bc: remove_filter', function (data) {
    document.getElementById(data).setAttribute('data-filter', document.getElementById(data).style.WebkitFilter);
    document.getElementById(data).style.WebkitFilter = '';
  });
  // replace filter
  socket.on('bc: restore_filter', function (data) {
    document.getElementById(data).style.WebkitFilter = document.getElementById(data).getAttribute('data-filter');
    document.getElementById(data).removeAttribute('data-filter');
  });

  // disable dragging; other client is moving image
  socket.on('bc: freeze', function (data) {
    $('#' + data).draggable ( 'disable' );
  });
  // enable dragging; other client has stopped moving image
  socket.on('bc: unfreeze', function (data) {
    $('#' + data).draggable ( 'enable' );
  });

  // hide element; other client has primed image for deletion
  socket.on('bc: hide_image', function (data) {
    document.getElementById(data).style.display = 'none';
  });
  // show element; other client has cancelled deletion
  socket.on('bc: show_image', function (data) {
    console.log(data);
    document.getElementById(data).style.display = 'initial';

  });

  // if this client is the uploader, show upload statistics from busboy
  socket.on('bc: chunk_sent', function (uploaddata) {
    if (uploaddata.sessionID === sessionID) {
      uploadtotal += uploaddata.chunkSize;
      document.getElementById('upload-confirm-info').textContent = 'Uploaded ' + uploadtotal  + ' bytes of ' + document.getElementById('fileselect').files[0].size + ' bytes.';
    };
  });

  // insta_step 10: Add content to insta-container
  socket.on('se: add_content_to_insta_div', function (insta_fetch_data) {
    var i = 0,
      instaImagesEl = document.getElementById('insta-images-container');

    // set content in insta-header
    document.getElementById('insta-info-username').textContent = insta_fetch_data.username;
    document.getElementById('insta-image-profile').src = insta_fetch_data.profile_picture;
    document.getElementById('insta-profile-link').setAttribute('href', 'https://www.instagram.com/' + insta_fetch_data.username + '/?hl=en');

    // destroy current images in insta-images-container
    instaImagesEl.innerHTML = '';

    // use insta_images_src to display fetched Instagram images
    for (i = 0; i < insta_fetch_data.insta_images_src.length; i++ ) {

      var temp_img = document.createElement('img'),
        temp_div = document.createElement('div'),
        spacer_top = document.createElement('div'),
        spacer_middle = document.createElement('div'),
        spacer_bottom = document.createElement('div');

      temp_div.classList.add('insta_image_div');

      temp_img.setAttribute('id', 'insta' + i);
      temp_img.classList.add('insta_image');
      temp_img.src = insta_fetch_data.insta_images_src[i];
      temp_img.setAttribute('data-link', insta_fetch_data.insta_images_link[i]);

      spacer_top.classList.add('spacer_top_bottom');
      spacer_middle.classList.add('spacer_middle');
      spacer_bottom.classList.add('spacer_top_bottom');

      temp_div.appendChild(temp_img);
      instaImagesEl.appendChild(temp_div);

      // add spacers for scrolling
      if (i < insta_fetch_data.insta_images_src.length - 1) {
        instaImagesEl.appendChild(spacer_top);
        instaImagesEl.appendChild(spacer_middle);
        instaImagesEl.appendChild(spacer_bottom);
      };

      // insta_step 11: Make the imported Instagram images draggable

      // use a clone so that the images can escape the scrollable div
      $('#insta' + i).draggable(
        {
          helper: 'clone',
          appendTo: 'body',
          scroll: true,
          start:  function () {

            // insta_step 12: When dragging starts, save dragged image to server storage, using id as an index
//            console.log(this);

            socket.emit('ce: save_insta_image', { src: this.getAttribute('src'), id: parseInt(this.getAttribute('id').replace('insta', '')) });

            // assign temporary z-index
            this.style.zIndex = 60000;

            stateChange.hideDraggers();
          }
        });
    };
  }); // end of socket se: add_content_to_insta_div


  // insta_step 15: Receive new filename from server
  socket.on('ce: insta_download_ready', function (newFileData) {

  //  store new filename in an object with the id as the key
  insta_download_ready_filename['insta' + newFileData.iIndex] = newFileData.newFilename;

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

        if (insta_download_ready_filename[ui.draggable[0].getAttribute('id')] === undefined) {

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
        instaDropData.iFilename =  insta_download_ready_filename[ui.draggable[0].getAttribute('id')];
        // instaDropData.posleft = ui.offset.left;
        // instaDropData.postop = ui.offset.top;

        instaDropData.posLeft = ((ui.offset.left - (pageSettings.mainWide - pageSettings.imagesWide) / 2) / pageSettings.imagesWide * 100).toFixed(2) + '%';
        instaDropData.posTop = ((ui.offset.top - (pageSettings.mainHigh - pageSettings.imagesHigh) / 2) / pageSettings.imagesHigh * 100).toFixed(2) + '%';

        instaDropData.iWidth = window.getComputedStyle(ui.draggable[0]).width + '%';
        instaDropData.iHeight = window.getComputedStyle(ui.draggable[0]).height + '%';

        instaDropData.iwide = (parseFloat(window.getComputedStyle(ui.draggable[0]).width) / pageSettings.imagesWide * 100).toFixed(2) + '%';
        instaDropData.ihigh = (parseFloat(window.getComputedStyle(ui.draggable[0]).height) / pageSettings.imagesHigh * 100).toFixed(2) + '%';

        instaDropData.iLink = ui.draggable[0].getAttribute('data-link');

        socket.emit('ce: insta_drop', instaDropData);

        // delete id key from insta_download_ready_filename object
        delete insta_download_ready_filename[ui.draggable[0].getAttribute('id')];
      }

      wait_for_download();

      // It would be much less complex to initiate the download here,
      // however, this strategy (of starting the download when the drag starts)
      // provides a quicker user experience.
    }
  });



  // insta_step 20: Convert dragged image to typical .wallPic
  socket.on('se: change_clone_to_image', function(instaDBData) {
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
  socket.on('be: add_insta_image_to_other_clients', function (instaDBData) {
    var images_element = document.getElementById('images'),
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

    images_element.appendChild(imageEl);

    // assign drag to added element
    assignImageDrag(instaDBData.dom_id);
  });
















// **************
// replace with different form of upload

  // on file_select element change, load up the image preview
  $('#fileselect').on('change', function () {
    // open upload-preview-container
    stateChange.uploadPreview();
    readURL(this);
  });

  // this function puts the image selected by the browser into the upload_preview container.
  // http://stackoverflow.com/questions/18934738/select-and-display-images-using-filereader
  // https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
  function readURL(input) {
    var reader;

    if (input.files && input.files[0]) {
      reader = new FileReader();
      reader.onload = function (event) {
        // wait until the image is ready to upload_preview container
        document.getElementById('upload-preview-container').classList.add('upload-preview-container_is_open');
        document.getElementById('image-upload-preview').src = event.target.result;
      };
      reader.readAsDataURL(input.files[0]);
    };
  }

  // confirm upload button
  // on click, send a submit to the html form with id='upload-form-button'
  // the html form with id='upload-form-button' posts to '/addfile'
  $('#button-confirm-upload').on('click', function () {
    document.getElementById('upload-confirm-container').style.display = 'none';

    $('#upload-form-button').ajaxSubmit({
      // method from jquery.form
      error: function (xhr) {
        console.log('Error:' + xhr.status);
        // change nav-main-container and remove upload_preview
        stateChange.afterUpload();
        uploadtotal = 0;
      },
      success: function (response) {
        // response variable from server is the uploaded file information
        var socketdata = {},
          images_element = document.getElementById('images'),
          imageEl = document.createElement('img');

        // create new image
        imageEl.setAttribute('id', response.dom_id);
        imageEl.setAttribute('title', response.imageFilename);
        imageEl.classList.add('wallPic');
        imageEl.src = response.location + response.imageFilename;
        imageEl.setAttribute('data-scale', '1');
        imageEl.setAttribute('data-angle', '0');
        imageEl.setAttribute('data-rotateX', '0');
        imageEl.setAttribute('data-rotateY', '0');
        imageEl.setAttribute('data-rotateZ', '0');
        imageEl.setAttribute('data-persective', '0');
        imageEl.style.width = config.uploadWidth;
        imageEl.style.height = config.uploadheight;
        imageEl.style.zIndex = response.z_index;
        imageEl.style.top = config.uploadTop;
        imageEl.style.left = config.uploadLeft;
        imageEl.style.opacity = 1;
        imageEl.style.WebkitFilter = 'grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)';
        imageEl.style.transform = 'rotate(0deg) scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg)';

        // Add <div id='dom_id'> to <div id='images'>
        images_element.appendChild(imageEl);
        // assign drag to added element
        assignImageDrag(response.dom_id);
        // change navigation container and remove upload_preview
        stateChange.afterUpload();
        // emit to other clients
        socketdata.uploadedFilename = response.imageFilename;
        socket.emit('ce:  share_upload', socketdata);

        uploadtotal = 0;
      }
    });
  });
