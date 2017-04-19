// keep modularizing
// state changes
// buttons
// fix selected-image id


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

import config from './config';
import debug from './debug/debug';
import configureStore from './store/configureStore';
import stateChange from './views/state-change';
import buttons from './components/buttons';

// dispatched when an image is dragged onto the exit_door icon or exit_door is clicked
import { setDeleteTarget } from './actions';

// dispatched when an image is clicked or dragged
import { setSelectedImage } from './actions';
const store = configureStore();

// debug tools
if (config.debugOn) debug.init(store);

buttons.init();

// set socket location : io.connect('http://localhost:8000'); || io.connect('http://www.domain_name.com');
var socket = io.connect([location.protocol, '//', location.host, location.pathname].join('')),

    // retrieve dragger size
    dragger_width = parseFloat(window.getComputedStyle(document.getElementsByClassName('dragger')[0]).width),
    dragger_height = parseFloat(window.getComputedStyle(document.getElementsByClassName('dragger')[0]).height),

    // retrieve window size; calculate inner_box size
    mainwide     = window.innerWidth,
    mainhigh     = window.innerHeight,
    inner_width  = mainwide - dragger_width,
    inner_height = mainhigh - dragger_height,

    // assigned when an image is clicked or dragged; used by draggers
    selected_file = {},

    // assigned by initial socket; used by upload counter
    sessionID = String,

    // assigned by initial socket; used by instagram link
    instaAppID = String,

    // used with a cookie to store which draggers are active for individual persistence
    switches_status = String,

    // used by the upload counter
    uploadtotal = 0,

    // used when an image is clicked more than once
    click_count = 0,
    previous_clicked_ids = '',

    // used when an image is dragged from the instagram div; assigned by socket when download is complete
    insta_download_ready_filename = {},

    // used when an access token is available for the client after a user authenticates with Instagram
    instaAccessReady = false;


    window.store = store;
    window.socket = socket;



  // set wrapper size; (css vh and vw were not working with mobile safari)
  document.getElementById('wrapper').style.width = window.innerWidth + 'px';
  document.getElementById('wrapper').style.height = window.innerHeight + 'px';

  // set app_info height
  document.getElementById('app_info').style.height = (window.innerHeight * 0.9) + 'px';

  // set explore_container height
  document.getElementById('explore_container').style.height = (window.innerHeight * 0.9) + 'px';


  // set insta_divs height
  document.getElementById('insta_div').style.height = (window.innerHeight) + 'px';
  document.getElementById('insta_image_container').style.height = (window.innerHeight * 0.8) + 'px';
  document.getElementById('insta_image_container').style.top = (window.innerHeight * 0.1) + 'px';
  document.getElementById('insta_header').style.height = (window.innerHeight * 0.07) + 'px';
  document.getElementById('background_opacity_trick').style.height = (window.innerHeight * 0.8) + 'px';
  document.getElementById('background_opacity_trick').style.top = (window.innerHeight * 0.1) + 'px';



  // set position and size of the close_info container divs
  document.getElementById('close_info_container').style.width = (parseFloat(window.getComputedStyle(document.getElementById('app_info')).height) * 0.1) + 'px';
  document.getElementById('close_info_container').style.height = (parseFloat(window.getComputedStyle(document.getElementById('app_info')).height) * 0.1) + 'px';
  document.getElementById('close_info_container').style.top = (mainhigh * 0.05) + (parseFloat(window.getComputedStyle(document.getElementById('app_info')).height) - parseInt(document.getElementById('close_info_container').style.height)) + 'px';

  // set position and size of the x_icon container divs
  document.getElementById('close_explore_container').style.width = (parseFloat(window.getComputedStyle(document.getElementById('app_info')).height) * 0.1) + 'px';
  document.getElementById('close_explore_container').style.height = (parseFloat(window.getComputedStyle(document.getElementById('app_info')).height) * 0.1) + 'px';
  document.getElementById('close_explore_container').style.top = (mainhigh * 0.05) + (parseFloat(window.getComputedStyle(document.getElementById('app_info')).height) - parseInt(document.getElementById('close_explore_container').style.height)) + 'px';


  // add perspective to 3d transforms
  document.getElementById('images').style.width = window.innerWidth + 'px';
  document.getElementById('images').style.height = window.innerHeight + 'px';
  document.getElementById('images').style.webkitPerspective = '500px';
  document.getElementById('images').style.webkitPerspectiveOriginX = '50%';
  document.getElementById('images').style.webkitPerspectiveOriginY = '50%';

  // position the navigation_toggle_button_container on the bottom on startup.
//  document.getElementById('navigation_toggle_button_container').style.left = (mainwide - parseFloat(window.getComputedStyle(document.getElementById('navigation_toggle_button_container')).width) + 'px');
  document.getElementById('navigation_toggle_button_container').style.left = (mainwide - $('#navigation_toggle_button_container').width()) + 'px';


  // assign draggable to all .wallPic elements
  assigndrag();


  // insta_step 6: Open the instagram_div and fetch instagram data
  if (openInstagramDiv === true) {
    socket.emit('ce: get_instagram_data');

    document.getElementById('insta_header').style.display = 'flex';
    document.getElementById('insta_div').style.display = 'block';
    document.body.classList.add('button_container_is_open');

    // animate open hamburgers
    document.getElementById('line_one').style.top = '35%';
    document.getElementById('line_three').style.top = '65%';
  };


// --Page helpers

  // prevent default behavior to prevent iphone dragging and bouncing
  // http://www.quirksmode.org/mobile/default.html
//  document.ontouchmove = function (event) {
//    event.preventDefault();
//  };

  // process any click on the wrapper
  $('#wrapper').on('click touchstart', function (event) {
    var dragger_elements = {};

    // DEBUG:
    // uncomment to log whichever element is clicked on
    // console.log(event.target.getAttribute('id'));
    // uncomment to log all the elements below the click
    // console.log(document.querySelectorAll( ":hover" ));
    // uncomment to log whichever elements are clicked on. ONLY WORKS WITH CHROME
    // console.log(document.elementsFromPoint(event.pageX, event.pageY));

    // if the images div alone is clicked...
    if (event.target.getAttribute('id') === 'images') {
      dragger_elements = document.getElementsByClassName('dragger');
      // remove all draggers
      stateChange.hideDraggers();
      // close button containers and remove dragger_transitions
      document.body.classList.remove('dragger_transitions');
    }; // end of if
  }); // end of document.on.click

  // listen for resize and orientation changes and make adjustments
  window.addEventListener('resize', function () {
    mainwide = window.innerWidth;
    mainhigh = window.innerHeight;
    inner_width  = mainwide - dragger_width;
    inner_height = mainhigh - dragger_height;
    // set wrapper size
    document.getElementById('wrapper').style.width = window.innerWidth + 'px',
    document.getElementById('wrapper').style.height = window.innerHeight + 'px',
    // position the navigation_toggle_button_container on the bottom right on startup.
    document.getElementById('navigation_toggle_button_container').style.top = (mainhigh - parseFloat(window.getComputedStyle(document.getElementById('navigation_toggle_button_container')).height) + 'px');
    document.getElementById('navigation_toggle_button_container').style.left = (mainwide - parseFloat(window.getComputedStyle(document.getElementById('navigation_toggle_button_container')).width) + 'px');
  }, false);

  // used by delete image button
  function clear_selected_file() {
    console.log('hi');
    store.getState().selectedImage.id        = '';
    selected_file.imageFilename  = '';
    selected_file.src             = '';
    selected_file.width           = '';
    selected_file.height          = '';
    selected_file.transform       = '';
    selected_file.zindex          = '';
    store.dispatch(setSelectedImage(''));
  };

  // cookie setter
  function setCookie(cookie_name, cookie_value, days_til_expire) {
    var expires_string = '',
        d = new Date();

    d.setTime(d.getTime() + (days_til_expire * 24 * 60 * 60 * 1000));
    expires_string = 'expires=' + d.toUTCString();
    document.cookie = cookie_name + '=' + cookie_value + '; ' + expires_string;
  }

  // cookie value getter
  function getCookie(cookie_name) {
    var i = 0,
      cookie_element = '',
      // create an array of key=value pairs e.g. ['name=Shannon', 'sessionID=Vy94J6V1W']
      cookie_array = document.cookie.split(';');

    for ( i = 0; i < cookie_array.length; i++) {
      cookie_element = cookie_array[i];

      // remove leading empty characters from cookie element
      while (cookie_element.charAt(0) === ' ') cookie_element = cookie_element.substring(1);

      // if the cookie_name can be found in the element, return the key portion of the element
      if (cookie_element.indexOf(cookie_name) === 0)
        return cookie_element.substring(cookie_name.length + 1, cookie_element.length);
    };
    // else return empty string
    return '';
  }


  // remove
  // if (document.getElementById('insta_div').style.display === 'block') {
  //   history.replaceState({}, 'wall-collective', '/');
  //   document.getElementById('insta_header').style.display = 'none';
  //   document.getElementById('insta_div').style.display = 'none';
  // };


// --Create grid line divs
//    use left/top parameter with unit
//    id is optional

  function vline(left, color, id) {
    var wrapper_element = document.getElementById('wrapper'),
      line_element = document.createElement('div');

    if (id) line_element.setAttribute('id', id);
    line_element.classList.add('vline');
    line_element.style.backgroundColor = color;
    line_element.style.left = left;
    // add 'line_element' to 'wrapper'
    wrapper_element.appendChild(line_element);
  } // end of vline

  function hline(top, color, id) {
    var wrapper_element = document.getElementById('wrapper'),
      line_element = document.createElement('div');

    if (id) line_element.setAttribute('id', id);
    line_element.classList.add('hline');
    line_element.style.backgroundColor = color;
    line_element.style.top = top;
    // add 'line_element' to 'wrapper'
    wrapper_element.appendChild(line_element);
  } // end of hline

  // create a grid and dragger_info box.  used when draggers are dragging.
  function make_grid() {
    var wrapper_element = document.getElementById('wrapper'),
      info_element = document.createElement('div');

    info_element.setAttribute('id', 'dragger_info');
    info_element.style.left = ((dragger_width / 2) + 1) + 'px';
    info_element.style.height = (dragger_height / 2) + 'px';
    info_element.style.width = (mainwide - dragger_width - 2) + 'px';
    // add 'info_element' to 'wrapper'
    wrapper_element.appendChild(info_element);
    // show grid lines
    vline((mainwide - (dragger_width / 2))  + 'px', 'red'   , 'inner_right');
    vline((dragger_width / 2)               + 'px', 'blue'  , 'inner_left');
    hline((mainhigh - (dragger_height / 2)) + 'px', 'purple', 'inner_bottom');
    hline((dragger_height / 2)              + 'px', 'yellow', 'inner_top');
  }; // end of make_grid

  function remove_grid() {
    // remove the elements created by make_grid
    document.getElementById('inner_top').remove();
    document.getElementById('inner_bottom').remove();
    document.getElementById('inner_left').remove();
    document.getElementById('inner_right').remove();
    document.getElementById('dragger_info').remove();
  }; // end of remove_grid

// --Socket.io
//     These functions receive an emit from the server,
//     recognize its name, receive its data, and do something with the data.
//
//     socket.on('bc: name', function(data) {
//       use data
//     });


  // on initial connect, retrieve sessionID cookie and send results to server
  socket.on('connect', function () {
    var clientVars = {};

    clientVars.sessionID = getCookie('sessionID');
    socket.emit ('c-e:  sessionID_check', clientVars);

  });


  // used to see instagram results
  socket.on('check_out', function (data) {
    console.log(data);
  });


  socket.on('ce: insta_access_ready', function () {
    instaAccessReady = true;
  });

  // initial set up for all visits.
  socket.on('connect_set_clientVars', function (clientVars) {
    var i = 0,
      switches = ['stretch', 'rotation', 'opacity', 'blur_brightness', 'contrast_saturate', 'grayscale_invert', 'threeD', 'party'];

    // assign sessionID.  used by upload_counter and user_count
    // the server sends a unique id or the previous id from the cookie
    sessionID = clientVars.sessionID;

    instaAppID = clientVars.instaAppID;

//    instaAccessReady = clientVars.clients_instaAccessReady;

    // set or reset sessionID cookie
    setCookie('sessionID', sessionID, 7);

    // hack: Problem:  busboy stream received the file stream before the sessionID, which was passed as a data value in the ajax submit
    //       Solution: change the HTML 'name' attribute of the form's input to the sessionID, which always arrives concurrently
    document.getElementById('fileselect').setAttribute('name', sessionID);

    // switches_status cookie stores which draggers are activated when the page loads; capital letters denote an activated dragger
    if (getCookie('switches_status') === '') setCookie('switches_status', 'SRObcgtp', 7);

    switches_status = getCookie('switches_status');

    // if the switches_status character is uppercase, switch on the corresponding dragger_switch
    for ( i = 0; i < switches.length; i++ ) {
      if (switches_status[i] === switches_status[i].toUpperCase()) document.getElementById(switches[i] + '_dragger_switch').classList.add('switchon');
    };
  });

  // display the number of connected clients
  socket.on('bc: change_user_count', function (data) {
    var i = 0,
      content = '',
      connect_info_element = document.getElementById('connect_info');

    // for each connected_client, add an icon to connect_info element
    for ( i = 0; i < data.length; i++ ) {
      content = content + "<img src='icons/person_icon.png' class='person_icon' />";
      // debug: report sessionID rather than image. underline connected sessionID
      // if (data[i] === sessionID) content = content + '<u>'; content = content + '  ' + data[i]; if (data[i] === sessionID) content = content + '</u>';
    };
    connect_info_element.innerHTML = content;
  });

  // on another client moving an image, move target
  socket.on('bc: moving', function (data) {
    document.getElementById(data.image_id).style.top  = data.imageTop;
    document.getElementById(data.image_id).style.left = data.imageLeft;
  });

  // on another client resizing an image, resize target
  socket.on('bc: resizing', function (data) {
    document.getElementById(data.image_id).style.transform = data.imageTransform;
    document.getElementById(data.image_id).style.top       = data.imageTop;
    document.getElementById(data.image_id).style.left      = data.imageLeft;
    document.getElementById(data.image_id).style.width     = data.imageWidth;
    document.getElementById(data.image_id).style.height    = data.imageHeight;
  });

  // on resize stop, resize target with new parameters
  socket.on('bc: resized', function (data) {
    document.getElementById(data.image_id).style.transform = data.imageTransform;
    document.getElementById(data.image_id).style.top       = data.imageTop;
    document.getElementById(data.image_id).style.left      = data.imageLeft;
    document.getElementById(data.image_id).style.width     = data.imageWidth;
    document.getElementById(data.image_id).style.height    = data.imageHeight;
  });

  // on transforming, transform target
  socket.on('bc: transforming', function (data) {
    document.getElementById(data.image_id).style.transform = data.imageTransform;
  });

  // on transform changes, modify data attributes used by set_dragger_locations
  socket.on('bc: change_data_attributes', function (data) {
    document.getElementById(data.image_id).setAttribute('data-scale', data.scale);
    document.getElementById(data.image_id).setAttribute('data-angle', data.angle);
    document.getElementById(data.image_id).setAttribute('data-rotateX', data.rotateX);
    document.getElementById(data.image_id).setAttribute('data-rotateY', data.rotateY);
    document.getElementById(data.image_id).setAttribute('data-rotateZ', data.rotateZ);
  });

  // on opacity changing, adjust target
  socket.on('bc: opacity_changing', function (data) {
    document.getElementById(data.image_id).style.opacity = data.imageOpacity;
  });

  // on filter changing, adjust target
  socket.on('bc: filter_changing', function (data) {
    document.getElementById(data.image_id).style.WebkitFilter = data.imageFilter;
  });

  // reset page across all clients
  socket.on('bc: resetpage', function () {
    window.location.reload(true);
  });

  // add uploaded image
  socket.on('bc: add_upload', function (data) {
    var images_element = document.getElementById('images'),
      image_element = document.createElement('img');

    image_element.setAttribute('id', data.dom_id);
    image_element.src = data.location + data.imageFilename;
    image_element.classList.add('wallPic');
    image_element.setAttribute('title', data.imageFilename);
    image_element.setAttribute('data-scale', '1');
    image_element.setAttribute('data-angle', '0');
    image_element.setAttribute('data-rotateX', '0');
    image_element.setAttribute('data-rotateY', '0');
    image_element.setAttribute('data-rotateZ', '0');
    image_element.style.width = config.uploadWidth;
    image_element.style.zIndex = data.z_index;
    image_element.style.top = config.uploadTop;
    image_element.style.left = config.uploadLeft;
    image_element.style.opacity = 1;
    image_element.style.WebkitFilter = 'grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)';
    image_element.style.transform = 'rotate(0deg) scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg)';

    // Add <img id='dom_id'> to <div id='images'>
    images_element.appendChild(image_element);
    // assign drag to added element
    assigndrag(data.dom_id);
  });

  // remove deleted image
  socket.on('bc: delete_image', function (data) {
    document.getElementById(data.id_to_delete).remove();
    if (data.id_to_delete === store.getState().selectedImage.id) {
      clear_selected_file();
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
      document.getElementById('confirm_or_reject_container_info').textContent = 'Uploaded ' + uploadtotal  + ' bytes of ' + document.getElementById('fileselect').files[0].size + ' bytes.';
    };
  });

  // insta_step 10: Add content to insta_div
  socket.on('se: add_content_to_insta_div', function (insta_fetch_data) {
    var i = 0,
      insta_image_container = document.getElementById('insta_image_container');

    // set content in insta_header
    document.getElementById('insta_username').textContent = insta_fetch_data.username;
    document.getElementById('insta_profile_pic').src = insta_fetch_data.profile_picture;
    document.getElementById('insta_profile_link').setAttribute('href', 'https://www.instagram.com/' + insta_fetch_data.username + '/?hl=en');

    // destroy current images in insta_image_container
    insta_image_container.innerHTML = '';

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
      insta_image_container.appendChild(temp_div);

      // add spacers for scrolling
      if (i < insta_fetch_data.insta_images_src.length - 1) {
        insta_image_container.appendChild(spacer_top);
        insta_image_container.appendChild(spacer_middle);
        insta_image_container.appendChild(spacer_bottom);
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
            console.log(this);

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
      clone = ui.draggable.clone(false);
      clone.css('left', ui.offset.left)
           .css('top', ui.offset.top)
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
        instaDropData.posleft = ui.offset.left;
        instaDropData.postop = ui.offset.top;
        instaDropData.iWidth = window.getComputedStyle(ui.draggable[0]).width;
        instaDropData.iHeight = window.getComputedStyle(ui.draggable[0]).height;
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
    var image_element = document.getElementById(instaDBData.iID);

    image_element.setAttribute('id', instaDBData.dom_id);
    image_element.src = instaDBData.location + instaDBData.iFilename;
    image_element.classList.add('wallPic');
    image_element.style.width = instaDBData.width;
    image_element.style.height = instaDBData.height;
    image_element.classList.remove('insta_image');
    image_element.setAttribute('title', instaDBData.iFilename);
    image_element.setAttribute('data-link', instaDBData.insta_link);
    image_element.setAttribute('data-scale', '1');
    image_element.setAttribute('data-angle', '0');
    image_element.setAttribute('data-rotateX', '0');
    image_element.setAttribute('data-rotateY', '0');
    image_element.setAttribute('data-rotateZ', '0');
    image_element.style.zIndex = instaDBData.z_index;
    image_element.style.opacity = 1;
    image_element.style.WebkitFilter = 'grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)';
    image_element.style.transform = 'rotate(0deg) scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg)';

    // assign drag to added element
    assigndrag(instaDBData.dom_id);
  });

  // insta_step 22: Add image to other clients
  socket.on('be: add_insta_image_to_other_clients', function (instaDBData) {
    var images_element = document.getElementById('images'),
      image_element = document.createElement('img');

    image_element.setAttribute('id', instaDBData.dom_id);
    image_element.setAttribute('title', instaDBData.iFilename);
    image_element.src = instaDBData.location + instaDBData.iFilename;
    image_element.classList.add('wallPic');
    image_element.style.width = instaDBData.width;
    image_element.style.height = instaDBData.height;
    image_element.style.top = instaDBData.postop;
    image_element.style.left = instaDBData.posleft;
    image_element.style.zIndex = instaDBData.z_index;
    image_element.setAttribute('data-link', instaDBData.insta_link);


    image_element.setAttribute('data-scale', '1');
    image_element.setAttribute('data-angle', '0');
    image_element.setAttribute('data-rotateX', '0');
    image_element.setAttribute('data-rotateY', '0');
    image_element.setAttribute('data-rotateZ', '0');
    image_element.style.opacity = 1;
    image_element.style.WebkitFilter = 'grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)';
    image_element.style.transform = 'rotate(0deg) scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg)';

    images_element.appendChild(image_element);

    // assign drag to added element
    assigndrag(instaDBData.dom_id);
  });





// --Buttons
//     IMPORTANT: Delegated vs. Direct binding
//     Example:  $('#id').on('click', function() { console.log('hi')};
//     This is a direct binding, which means new elements added to the DOM won't work.
//     Instead, use a delegated binding:
//     Example:  $( document ).on('click', '.upload', function(){
//     IMPORTANT: I've changed my mind.
//     Delegated binding seems to cost more resources in the number of compares to process.
//     Go with direct binding.

  // main navigation toggle button
  $('#navigation_toggle_button').on( 'click', function () {
    var button_element = document.getElementById('navigation_toggle_button');

    // if the button is being dragged, don't use the click.  FUTURE WORK: stop event propagation
    if ( button_element.classList.contains('dragging_no_click') === false ) {

      // otherwise, if button containers are open
      if ( document.body.classList.contains('button_container_is_open') ) {
        // close all containers
        stateChange.closeAll();
        // show selected_file in case it was removed by being dragged onto the exit door
        // except when no file is selected: store.getState().selectedImage.id is undefined or ''
        if ( store.getState().selectedImage.id !== '' ) {
          document.getElementById(store.getState().selectedImage.id).style.display = 'initial';
        };
      // else when no containers are open
      } else {
        // open the navigation container
        document.getElementById('navigation_container').classList.add('navigation_container_is_open');
        document.body.classList.add('button_container_is_open');
        document.getElementById('connect_info').classList.add('connect_info_is_open');

        // animate open hamburgers
        document.getElementById('line_one').style.top = '35%';
        document.getElementById('line_three').style.top = '65%';

        stateChange.hideDraggers();
      };
    };
  });


  //
  // <div id='exit_door' class='button navigation_button'> remove
  //   <img class='icon_image' src='/icons/door_icon.png'>
  // </div>


var exitDoor = require('./exit-door');


  // dragger_all_switch; used to toggle all dragger switches
  $('#dragger_all_switch').click(function () {
    var i = 0,
      switch_elements = {},
      dragger_elements = {};

    // add or remove 'switchon' class in dragger_all_switch
    this.classList.toggle('switchon');
    // if dragger_all_switch has been switched on
    if (document.getElementById('dragger_all_switch').classList.contains('switchon')) {
      // add 'switchon' class to all dragger_switch elements
      switch_elements = document.getElementsByClassName('dragger_switch');
      for (i = 0; i < switch_elements.length; i++) {
        switch_elements[i].classList.add('switchon');
      };
      // set dragger element locations
      set_dragger_locations(store.getState().selectedImage.id);
      // show dragger elements if an image is selected
      if (store.getState().selectedImage.id) {
        dragger_elements = document.getElementsByClassName('dragger');
        for (i = 0; i < dragger_elements.length; i++) {
          dragger_elements[i].style.display = 'block';
        };
      };
      // set cookie to all uppercase
      setCookie('switches_status', 'SROBCGTP', 7);
      switches_status = 'SROBCGTP';
    // else when dragger_all_switch has been switched off
    } else {
      // remove 'switchon' class from dragger_status elements
      switch_elements = document.getElementsByClassName('dragger_switch');
      for (i = 0; i < switch_elements.length; i++) {
        switch_elements[i].classList.remove('switchon');
      };
      // hide all draggers
      dragger_elements = document.getElementsByClassName('dragger');
      for (i = 0; i < dragger_elements.length; i++) {
        dragger_elements[i].style.display = 'none';
      };
      // set cookie to all lowercase
      setCookie('switches_status', 'srobcgtp', 7);
      switches_status = 'srobcgtp';
    };
  });

  // set up dragger_switch functionalities
  $('.dragger_switch').click(function () {
    var switch_status_array = [],
    // use id='stretch_dragger_switch' to get 'stretch_dragger'
      dragger_name = this.getAttribute('id').replace('_switch', '');

    // toggle dragger_switch
    this.classList.toggle('switchon');

    // convert d_status string to array
    switch_status_array = switches_status.split('');

    // if switched on
    if (this.classList.contains('switchon')) {
      // set dragger locations
      set_dragger_locations(store.getState().selectedImage.id);
      // show dragger if an image is selected
      if (store.getState().selectedImage.id) {
        document.getElementById(dragger_name).style.display = 'block';
      };
      // use first letter of dragger_name to find corresponding character in array and replace it
      // with uppercase character to indicate dragger_switch is on
      switch_status_array[switch_status_array.indexOf(dragger_name[0])] = dragger_name[0].toUpperCase();
    // else when switched off
    } else {
      // hide dragger
      document.getElementById(dragger_name).style.display = 'none';
      // use first letter of dragger_name to find corresponding character in array and replace it
      // with lowercase character to indicate dragger_switch is off
      switch_status_array[switch_status_array.indexOf(dragger_name[0].toUpperCase())] = dragger_name[0].toLowerCase();
    };
    // convert switch_status_array back to string and set cookie
    switches_status = switch_status_array.join('');
    setCookie('switches_status', switches_status, 7);
  });

  // dragger_switches button
  $('#dragger_switches_button').on('click', function () {
    // toggle dragger_switches container
    document.getElementById('dragger_switches_container').classList.toggle('dragger_switches_container_is_open');
    // if dragger_switches container opens, close navigation container
    if (document.getElementById('dragger_switches_container').classList.contains('dragger_switches_container_is_open')) {
      document.getElementById('navigation_container').classList.remove('navigation_container_is_open');
    };
  });

  // reset page button
  // uses jquery $.get to reset the page, and sends socket to other clients to reset as well
  $('#reset_page_button').on('click', function () {
    $.get('/resetpage', function () {
      socket.emit('c-e:  resetpage');
      // reload the page
      window.location.assign([location.protocol, '//', location.host, location.pathname].join(''));
    });
  });

  $('#info_button').on('click', function () {
    document.getElementById('app_info').style.display = 'block';
    document.getElementById('close_info_container').style.display = 'block';
  });

  $('#close_info_container').on('click', function () {
    document.getElementById('app_info').style.display = 'none';
    document.getElementById('close_info_container').style.display = 'none';
  });




  // on file_select element change, load up the image preview
  $('#fileselect').on('change', function () {
    // open upload_preview_container
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
        document.getElementById('upload_preview_container').classList.add('upload_preview_container_is_open');
        document.getElementById('image_upload_preview').src = event.target.result;
      };
      reader.readAsDataURL(input.files[0]);
    };
  }

  // confirm upload button
  // on click, send a submit to the html form with id='upload_image_button'
  // the html form with id='upload_image_button' posts to '/addfile'
  $('#confirm_upload_button').on('click', function () {
    document.getElementById('confirm_or_reject_container').style.display = 'none';

    $('#upload_image_button').ajaxSubmit({
      // method from jquery.form
      error: function (xhr) {
        console.log('Error:' + xhr.status);
        // change navigation_container and remove upload_preview
        stateChange.afterUpload();
        uploadtotal = 0;
      },
      success: function (response) {
        // response variable from server is the uploaded file information
        var socketdata = {},
          images_element = document.getElementById('images'),
          image_element = document.createElement('img');

        // create new image
        image_element.setAttribute('id', response.dom_id);
        image_element.setAttribute('title', response.imageFilename);
        image_element.classList.add('wallPic');
        image_element.src = response.location + response.imageFilename;
        image_element.setAttribute('data-scale', '1');
        image_element.setAttribute('data-angle', '0');
        image_element.setAttribute('data-rotateX', '0');
        image_element.setAttribute('data-rotateY', '0');
        image_element.setAttribute('data-rotateZ', '0');
        image_element.setAttribute('data-persective', '0');
        image_element.style.width = config.uploadWidth;
        image_element.style.height = config.uploadheight;
        image_element.style.zIndex = response.z_index;
        image_element.style.top = config.uploadTop;
        image_element.style.left = config.uploadLeft;
        image_element.style.opacity = 1;
        image_element.style.WebkitFilter = 'grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)';
        image_element.style.transform = 'rotate(0deg) scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg)';

        // Add <div id='dom_id'> to <div id='images'>
        images_element.appendChild(image_element);
        // assign drag to added element
        assigndrag(response.dom_id);
        // change navigation container and remove upload_preview
        stateChange.afterUpload();
        // emit to other clients
        socketdata.uploadedFilename = response.imageFilename;
        socket.emit('c-e:  share_upload', socketdata);

        uploadtotal = 0;
      }
    });
  });

  // reject upload
  $('#reject_upload_button').on('click', function () {
    stateChange.afterUpload();
  });


  $('#n4').on('click', function () {

  });

  // reject delete
  $('#reject_delete_button').on('click', function () {
    var deleteTargetID = store.getState().deleteTarget.id;

    stateChange.rejectDelete();
    // send socket to show on other clients
    socket.emit('c-e:  show_image', deleteTargetID);
  });

  // confirm delete
  $('#confirm_delete_button').on('click', function () {
    var socketdata = {},
        deleteTarget = store.getState().deleteTarget;


    // remove image
    deleteTarget.element.remove();
    // change navigation container
    stateChange.afterDelete();
    // prepare data to send
    socketdata.filenameToDelete = deleteTarget.element.getAttribute('title');
    socketdata.id_to_delete = deleteTarget.id;
    // send data to server
    socket.emit('c-e:  delete_image', socketdata);
    clear_selected_file();
  });


  $('#instagram_login').on('click', function () {
    var redirect_url = [location.protocol, '//', location.host, location.pathname].join('');

    // redirect_url: http://www.example.com?myclient_id=johndoe
    redirect_url = redirect_url + '?myclient_id=' + sessionID;

    // insta_step 24: If the client has an access token, open Instagram divs and skip to insta_step 7.

    // instaAccessReady is assigned during the initial socket 'connect_set_clientVars'
    if (instaAccessReady === true) {

      socket.emit('ce: get_instagram_data');

      document.getElementById('insta_header').style.display = 'flex';
      document.getElementById('insta_div').style.display = 'block';
      document.getElementById('upload_container').classList.remove('upload_container_is_open');
      document.body.classList.add('button_container_is_open');

      // animate open hamburgers
      document.getElementById('line_one').style.top = '35%';
      document.getElementById('line_three').style.top = '65%';

    } else {

      // insta_step 1: Redirect to Instagram API to prompt user to authenticate
      // instaAppID, provided to Instagram developers, is stored on the server
      // and fetched with the initial socket connection
      // Successful authentication will send the browser back to the server's
      // app.get('/') with 'myclient_id' and 'code' query parameter to be parsed by the server

      window.location = 'https://api.instagram.com/oauth/authorize/?client_id=' + instaAppID + '&redirect_uri=' + redirect_url + '&response_type=code';
    };

  });

  // insta_step 25: Use the instagram logout link in an image tag to log out.
  // http://stackoverflow.com/questions/10991753/instagram-api-user-logout
  $('#instagram_logout_button').on('click', function () {
    var logout_image_element = document.createElement('img');

    logout_image_element.src = 'http://instagram.com/accounts/logout/';
    logout_image_element.setAttribute('id', 'temp_instagram_logout');
    logout_image_element.style.display = 'none';
    logout_image_element.style.height = '0';
    logout_image_element.style.width = '0';

    // create the logout 'image' briefly in the dom.
    document.getElementById('wrapper').appendChild(logout_image_element);
    document.getElementById('temp_instagram_logout').remove();

    alert('logged out');

    // insta_step 26: Remove client's access token from server
    socket.emit('ce: remove_client_from_clients_access', sessionID);

    instaAccessReady = false;
  });





  $('#explore_button').on('click', function () {


    document.getElementById('explore_container').style.display = 'block';
    document.getElementById('close_explore_container').style.display = 'block';


    document.getElementById('explore_image').src = document.getElementById(store.getState().selectedImage.id).src;


    if (document.getElementById(store.getState().selectedImage.id).getAttribute('data-link').length > 1) {

      document.getElementById('insta_link').setAttribute('href', document.getElementById(store.getState().selectedImage.id).getAttribute('data-link'));
    };


    if ( (typeof store.getState().selectedImage.id !== 'undefined') && (store.getState().selectedImage.id.length > 0 ) ) {

      // if selected file is empty, fill it.




    } else {





    };
  });

  $('#close_explore_container').on('click', function () {
    document.getElementById('explore_container').style.display = 'none';
    document.getElementById('close_explore_container').style.display = 'none';
  });





// --Main drag function

  // use this function to assign draggable to all '.wallPic' elements
  // and then specific elements by passing an id
  function assigndrag(id) {

    if (typeof id === 'undefined') {
      id = '.wallPic';
    } else {
      id = '#' + id;
    };

    // draggable method from jquery.ui
    $(id).draggable(
      {
        // containment: 'window',
        stack: '.wallPic', // the stack option automatically adjusts z-indexes for all .wallPic elements
        scroll: true,
        start:  function (event, ui) {
          // recoup for transformed objects, to keep the drag event centered on a transformed object.
          // http://stackoverflow.com/questions/3523747/webkit-and-jquery-draggable-jumping
          // uses a ternary operator:
          //   boolean statement ? true result : false result;
          //   if boolean statement is true, do first, else do second.
          //   so if left is not a number, make it zero, otherwise make it left
          var left = parseInt(this.style.left),
            top = parseInt(this.style.top);

          left = isNaN(left) ? 0 : left;
          top = isNaN(top) ? 0 : top;
          this.recoupLeft = left - ui.position.left;
          this.recoupTop = top - ui.position.top;

          // store the original z index
          this.original_zindex = this.style.zIndex;

          // store image id
          this.image_id = this.getAttribute('id');

          // assign temporary z-index
          this.style.zIndex = 60000;

          stateChange.hideDraggers();

          // remove filter
          // --this is necessary because dragging images with filter causes too much rendering lag
          this.setAttribute('data-filter', this.style.webkitFilter);
          this.style.webkitFilter = '';

          // send emit to remove filter from other clients
          socket.emit('c-e:  remove_filter', this.image_id);

          // pass id to c-e:  freeze
          socket.emit('c-e:  freeze', this.image_id);

          // begin to prepare socketdata
          this.socketdata = {};
          this.socketdata.image_id = this.image_id;
        },
        drag: function (event, ui) {
          // recoup drag position
          ui.position.left += this.recoupLeft;
          ui.position.top += this.recoupTop;

          // prepare socketdata to pass
          this.socketdata.imageTop = this.style.top;
          this.socketdata.imageLeft = this.style.left;

          // pass socket data to server
          socket.emit('c-e:  moving', this.socketdata);
        },
        stop: function () {
          // prepare data to send to ajax post, get all wallPic elements
          var dropPost = {},
            i = 0,
            drawing_elements = document.body.getElementsByClassName('wallPic');

          // return to the original z-index
          this.style.zIndex = this.original_zindex;

          // restore filter
          this.style.webkitFilter = this.getAttribute('data-filter');
          this.removeAttribute('data-filter');

          // send emit to restore filter to other clients
          socket.emit('c-e:  restore_filter', this.image_id);

          // send emit to unfreeze in other clients
          socket.emit('c-e:  unfreeze', this.image_id);

          // prepare data to send to server
          dropPost.domIDs = [];
          dropPost.filenames = [];
          dropPost.zIndexes = [];
          dropPost.dFilename = this.getAttribute('title');
          dropPost.dLeft = this.style.left;
          dropPost.dTop = this.style.top;

          // populate dropPost
          for (i = 0; i < drawing_elements.length; i++) {
            dropPost.domIDs[i] = drawing_elements[i].getAttribute('id');
            dropPost.filenames[i] = drawing_elements[i].getAttribute('title');
            dropPost.zIndexes[i] = drawing_elements[i].style.zIndex;
          };

          // ajax post from jquery.  FUTURE WORK: replace with a socket
          $.ajax({
            method: 'POST',
            url: '/dragstop',
            data: JSON.stringify( { dropPost: dropPost} ),
            contentType: 'application/json'
          }).done(function () {
          });

          // for set dragger locations
          store.getState().selectedImage.id = this.getAttribute('id');
          store.dispatch(setSelectedImage(this.getAttribute('id')));


          // reset click count
          click_count = 0;

//          set_dragger_locations(store.getState().selectedImage.id);
        }
      }).click( function () {
        var i = 0,
            image_objects = document.getElementsByClassName('wallPic'),
            id_and_zindex = [],
            clicked_ids_zindexes = [],
            clickX = event.pageX,
            clickY = event.pageY,
            offset_left = 0,
            offset_top = 0,
            image_px_range = {},
            clicked_ids = '';

        // for each .wallPic on the page...
        for (i = 0; i < image_objects.length; i ++) {

          // calculate the range of pixels it occupies on the page...
          offset_left = image_objects[i].getBoundingClientRect().left + document.body.scrollLeft;
          offset_top = image_objects[i].getBoundingClientRect().top + document.body.scrollTop;
          image_px_range = { x: [ offset_left, offset_left + image_objects[i].offsetWidth ],
                             y: [ offset_top, offset_top + image_objects[i].offsetHeight] };

          // if the click is within the image's range, add the .wallPic id and z-index to an array.
          if ( (clickX >= image_px_range.x[0] && clickX <= image_px_range.x[1]) && (clickY >= image_px_range.y[0] && clickY <= image_px_range.y[1]) ) {
            id_and_zindex = [ image_objects[i].id, image_objects[i].style.zIndex ];
            clicked_ids_zindexes.push(id_and_zindex);
          };
        };

        // sort the array by z-index, highest to lowest.
        clicked_ids_zindexes.sort(function (a, b) {
          return b[1] - a[1];
        });

        // if selected_file is not empty, remove selected_file_animation class
        if ( (typeof store.getState().selectedImage.id !== 'undefined') && (store.getState().selectedImage.id.length > 0 ) ) {
          document.getElementById(store.getState().selectedImage.id).classList.remove('selected_file_animation');
          // css-trick: this will 'trigger a reflow' which will allow the class to be added again before the animation ends.
          document.getElementById(store.getState().selectedImage.id).offsetWidth;
        };

        // if one image is clicked...
        if (clicked_ids_zindexes.length === 1) {

          // set the selected_file
          store.getState().selectedImage.id = this.getAttribute('id');
          store.dispatch(setSelectedImage(this.getAttribute('id')));

          // add the selected_file_animation class
          document.getElementById(store.getState().selectedImage.id).classList.add('selected_file_animation');

          // reset the click count
          click_count = 0;
          console.log('click count: ' + click_count);

        // else when more than one image is clicked...
        } else {
          // create a string of clicked ids
          for (i = 0; i < clicked_ids_zindexes.length; i++) {
            clicked_ids = clicked_ids + '.' + clicked_ids_zindexes[i][0];
            // remove temp_fade from all clicked images
            document.getElementById(clicked_ids_zindexes[i][0]).classList.remove('temp_fade');
            document.getElementById(clicked_ids_zindexes[i][0]).offsetWidth;

          };
          // if the clicked_ids have changed, reset the click_count to 0
          if ((clicked_ids !== previous_clicked_ids) || (previous_clicked_ids === '')) click_count = 0;

          // add a click
          click_count++;
          // console.log('click_count: ' + click_count);
          // console.log((click_count - 1) % clicked_ids_zindexes.length);

          // set the selected image to an id in the clicked array using the remainder of the click_count divided by the number of clicked images
          store.getState().selectedImage.id = clicked_ids_zindexes[(click_count - 1) % clicked_ids_zindexes.length][0];
          document.getElementById(store.getState().selectedImage.id).classList.add('selected_file_animation');

          // add temp_fade class to all clicked images other than the one selected
          for (i = 0; i < clicked_ids_zindexes.length; i++) {

            // don't add temp_fade class to selected_file, or to an image already faded, or if the selected_file is already on top
            if ((clicked_ids_zindexes[i][0] !== store.getState().selectedImage.id) && (document.getElementById(clicked_ids_zindexes[i][0]).style.opacity > 0.50)
               && ( (click_count % clicked_ids_zindexes.length) !== 1 )) {
              document.getElementById(clicked_ids_zindexes[i][0]).classList.add('temp_fade');
            };
          };

          // store clicked ids in a global string.  Note: Can't use an array as global variable.  Primitives are passed by value.  Objects are passed by 'copy of a reference'.
          previous_clicked_ids = clicked_ids;
        };

        set_dragger_locations(store.getState().selectedImage.id);

      });
  };


// --Interact('.wallPic').gesturable, for touchscreen rotating and scaling

  interact('.wallPic').gesturable({
    onstart: function (event) {

      this.image_id = event.target.getAttribute('id');
      this.image_element = event.target;

      stateChange.hideDraggers();

      // retrieve original angle and scale
      this.angle = parseFloat(this.image_element.getAttribute('data-angle'));
      this.scale = parseFloat(this.image_element.getAttribute('data-scale'));

      // pass id to c-e:  freeze
      socket.emit('c-e:  freeze', this.image_id);

      // prepare socketdata
      this.socketdata = {};
      this.socketdata.image_id = this.image_id;
      this.socketdata.imageFilename = this.image_element.getAttribute('title');
    },
    onmove: function (event) {
      // retrieve scale and angle from event object
      // event.ds is scale difference; event.da is the angle difference
      this.scale = this.scale * (1 + event.ds);
      this.angle += event.da;

      // modify element with new transform
      this.image_element.style.transform = this.image_element.style.transform.replace(/rotate\(.*?\)/, 'rotate(' + this.angle + 'deg)');
      this.image_element.style.transform = this.image_element.style.transform.replace(/scale\(.*?\)/ , 'scale(' + this.scale + ')');

      // send socketdata
      this.socketdata.imageTransform = this.image_element.style.transform;
      socket.emit('c-e:  transforming', this.socketdata);
    },
    onend: function (event) {
      // if angle is < 0 or > 360, revise the angle to 0-360 range
      if (this.angle < 0) {
        this.angle = (360 + this.angle);
        this.image_element.style.transform = this.image_element.style.transform.replace(/rotate\(.*?\)/, 'rotate(' + this.angle + 'deg)');
      };
      if (this.angle > 360) {
        this.angle = (this.angle - 360);
        this.image_element.style.transform = this.image_element.style.transform.replace(/rotate\(.*?\)/, 'rotate(' + this.angle + 'deg)');
      };

      // send socketdata
      this.socketdata.scale = this.scale.toFixed(2);
      this.socketdata.angle = this.angle.toFixed(2);
      this.socketdata.rotateX = this.image_element.getAttribute('data-rotateX');
      this.socketdata.rotateY = this.image_element.getAttribute('data-rotateY');
      this.socketdata.rotateZ = this.image_element.getAttribute('data-rotateZ');

      socket.emit('c-e:  store_data_attributes', this.socketdata);
      this.socketdata.imageTransform = this.image_element.style.transform;
      socket.emit('c-e:  store_transformed', this.socketdata);

      // pass id to c-e:  unfreeze
      socket.emit('c-e:  unfreeze', this.image_id);

      // put new scale and angle into data-scale and data-angle
      event.target.setAttribute('data-scale', this.scale.toFixed(2));
      event.target.setAttribute('data-angle', this.angle.toFixed(2));

      // reset draggers
//      set_dragger_locations(this.image_id);

      // reset click count
      click_count = 0;

    }
  });


// --Exit door.droppable, for preparing a dropped image to delete

  $('#n4').droppable({
    accept: '.wallPic',
    // activeClass: 'exit_active_class',
    hoverClass: 'exit_door_hover',
    tolerance: 'pointer',

    over: function () {
//       console.log('over exit door');
    },
    out: function () {
//       console.log('back out over exit door ');
    },
    drop: function (event, ui) {
//       console.log('Draggable wallPic dropped on exit door.');
      var deleteTarget = ui.draggable[0];


      store.dispatch(setDeleteTarget(deleteTarget));


      // hide original image
      deleteTarget.style.display = 'none';

      // hide draggers
      stateChange.hideDraggers();

      // show delete_preview_container
      stateChange.deletePreview();

      // send socket to hide on other clients
      socket.emit('c-e:  hide_image', deleteTarget.id);
    }
  });


// --Navigation_toggle_button.draggable, for dragging the navigation_toggle_button around the sides

  $('#navigation_toggle_button_container').draggable({
    cancel: true,
    containment: 'parent',
    scroll: false,
    start: function () {

      // used to prevent click from registering
      document.getElementById('navigation_toggle_button').classList.add('dragging_no_click');

      debug.clearDebugInfo();

      // get the starting size
      this.high = $(this).height();
      this.wide = $(this).width();

      // get values of top and left for bottom and right placements
      this.top_when_on_bottom_num = (mainhigh - this.high);
      this.left_when_on_right_num = (mainwide - this.wide);
      this.top_when_on_bottom_px = this.top_when_on_bottom_num.toString().concat('px');
      this.left_when_on_right_px = this.left_when_on_right_num.toString().concat('px');
      this.commit_distance = 5;
    },
    drag: function (event, ui) {
      // ui.position.top is wherever the drag cursor goes

      // take y axis measurements
      if (this.style.top === '0px') {
        // console.log('Top or Bottom: Top');
        this.yplace = 'top';
        this.mostrecentyplace = 'top';
      } else if (this.style.top === this.top_when_on_bottom_px) {
        // console.log('Top or Bottom: Bottom');
        this.yplace = 'bottom';
        this.mostrecentyplace = 'bottom';
      } else {
        // console.log('Top or Bottom: Between');
        this.yplace = 'between';
      };

      // take x axis measurements
      if (this.style.left === '0px') {
        // console.log('Left or Right: Left');
        this.xplace = 'left';
        this.mostrecentxplace = 'left';
      } else if (this.style.left === this.left_when_on_right_px) {
        // console.log('Left or Right: Right');
        this.xplace = 'right';
        this.mostrecentxplace = 'right';
      } else {
        // console.log('Left or Right: Between');
        this.xplace = 'between';
      };

      // console.log('Corner: Not a corner.');

      // if the element is on a side already, keep it there
      if ((this.yplace === 'top') && (this.xplace === 'between') ) {
        ui.position.top = 0;
      } else if ((this.yplace === 'bottom') && (this.xplace === 'between') ) {
        ui.position.top = this.top_when_on_bottom_num;
      } else if ((this.xplace === 'left') && (this.yplace === 'between') ) {
        ui.position.left = 0;
      } else if ((this.xplace === 'right') && (this.yplace === 'between') ) {
        ui.position.left = this.left_when_on_right_num;
      // else when the element is in a corner
      // usually the next drag ui will lock the element to a side
      // but on the occasion that the ui.position goes uniformly toward the center (e.g. 0,0 to 1,1)
      // select the side based on which directional threshold the ui crosses first
      } else {
        // console.log(`Corner: ${this.mostrecentxplace} ${this.mostrecentyplace}`);
        // top left corner: left drag
        if ( (this.mostrecentxplace === 'left') && (this.mostrecentyplace === 'top') && (ui.position.left > this.commit_distance) ) {
          ui.position.top = 0;
        };
        // top left corner: down drag
        if ( (this.mostrecentxplace === 'left') && (this.mostrecentyplace === 'top') && (ui.position.top > this.commit_distance) ) {
          ui.position.left = 0;
        };
        // top right corner: right drag
        if ( (this.mostrecentxplace === 'right') && (this.mostrecentyplace === 'top') && (this.left_when_on_right_num - ui.position.left > this.commit_distance) ) {
          ui.position.top = 0;
        };
        // top right corner: down drag
        if ( (this.mostrecentxplace === 'right') && (this.mostrecentyplace === 'top') && (ui.position.top > this.commit_distance) ) {
          ui.position.left = this.left_when_on_right_num;
        };
        // bottom left corner: left drag
        if ( (this.mostrecentxplace === 'left') && (this.mostrecentyplace === 'bottom') && (ui.position.left > this.commit_distance ) ) {
          ui.position.top = this.top_when_on_bottom_num;
        };
        // bottom left corner: up drag
        if ( (this.mostrecentxplace === 'left') && (this.mostrecentyplace === 'bottom') && (this.top_when_on_bottom_num - ui.position.top > this.commit_distance) ) {
          ui.position.left = 0;
        };
        // bottom right corner: right drag
        if ( (this.mostrecentxplace === 'right') && (this.mostrecentyplace === 'bottom') && (this.left_when_on_right_num - ui.position.left > this.commit_distance) ) {
          ui.position.top = this.top_when_on_bottom_num;
        };
        // bottom right corner: up drag
        if ( (this.mostrecentxplace === 'right') && (this.mostrecentyplace === 'bottom') && (this.top_when_on_bottom_num - ui.position.top > this.commit_distance) ) {
          ui.position.left = this.left_when_on_right_num;
        };
      };
    },
    stop: function () {
      // this causes the class to be removed before the next click event begins
      setTimeout( function () {
        document.getElementById('navigation_toggle_button').classList.remove('dragging_no_click');
//        navigation_toggle_button_is_stationary = true;
      }, 200);
    }
  });


// --Draggers

  $('#stretch_dragger').draggable({
    containment: 'parent',
    scroll: false,
    start: function () {
      // hide other draggers
      stateChange.hideOtherDraggers(this.getAttribute('id'));
      // prepare dom elements for manipulation
      this.image_id      = store.getState().selectedImage.id;
      this.image_element = document.getElementById(store.getState().selectedImage.id);
      // prepare the socketdata
      this.socketdata = {};
      this.socketdata.image_id = this.image_id;
      // gather selected_image stats
      this.image_original_width  = parseInt(this.image_element.style.width);
      this.image_original_height = parseInt(this.image_element.style.height);
      this.image_original_left   = parseInt(this.image_element.style.left);
      this.image_original_top   = parseInt(this.image_element.style.top);
      // show some grid lines and dragger_info box
      make_grid();
      this.dragger_info = document.getElementById('dragger_info');
      // disallow transitions
      this.classList.remove('dragger_transitions');
      // put the filter in a data attribute and remove filter
      // --this was necessary because dragging images with filter caused too much rendering lag
      this.image_element.setAttribute('data-filter', this.image_element.style.WebkitFilter);
      this.image_element.style.WebkitFilter = '';
      // socket to other clients
      socket.emit('c-e:  remove_filter', this.image_id);
    },
    drag: function (event, ui) {
      // dynamic percentage defined by the dragger in relation to the inner window
      this.percentage_wide = ui.position.left / inner_width;
      this.percentage_high = (inner_height - ui.position.top) / inner_height;
      // calculate changes: define the selected_image's new width/height/left/right in relation to the window size
      this.new_width  = this.percentage_wide * mainwide;
      this.new_height = this.percentage_high * mainhigh;
      this.new_left   = this.image_original_left + (this.image_original_width  - this.new_width)  / 2;
      this.new_top    = this.image_original_top  + (this.image_original_height - this.new_height) / 2;
      // display the percentages in the dragger_info div
      this.dragger_info.textContent = 'width:' + (this.percentage_wide * 100).toFixed(0) +  '% height: ' + (this.percentage_high * 100).toFixed(0) + '%';
      // make the calculated changes
      this.image_element.style.width = this.new_width + 'px';
      this.image_element.style.height = this.new_height + 'px';
      this.image_element.style.left = this.new_left + 'px';
      this.image_element.style.top = this.new_top + 'px';
      // emit to other clients
      this.socketdata.imageTransform = this.image_element.style.transform;
      this.socketdata.imageWidth     = this.image_element.style.width;
      this.socketdata.imageHeight    = this.image_element.style.height;
      this.socketdata.imageLeft      = this.image_element.style.left;
      this.socketdata.imageTop       = this.image_element.style.top;
      socket.emit('c-e:  resizing', this.socketdata);
    },
    stop: function () {
      // remove grid and dragger_info box
      remove_grid();
      // allow transitions
      this.classList.add('dragger_transitions');
      // restore filter
      this.image_element.style.WebkitFilter = this.image_element.getAttribute('data-filter');
      this.image_element.removeAttribute('data-filter');
      // show draggers
      set_dragger_locations(this.image_id);
      // socket to other clients
      socket.emit('c-e:  restore_filter', this.image_id);
      // save to database
      this.socketdata.imageFilename  = this.image_element.getAttribute('title');
      // socket to other clients
      socket.emit('c-e:  store_resized', this.socketdata);
      // reset click count
      click_count = 0;
    }
  });

  $('#opacity_dragger').draggable({
    containment: 'parent',
    scroll: false,
    start: function () {
      // hide other draggers
      stateChange.hideOtherDraggers(this.getAttribute('id'));
      // prepare dom elements for manipulation
      this.image_id      = store.getState().selectedImage.id;
      this.image_element = document.getElementById(store.getState().selectedImage.id);
      // prepare the socketdata
      this.socketdata = {};
      this.socketdata.image_id = this.image_id;
      // gather selected_image stats
      this.image_original_opacity = this.image_element.style.opacity;
      // disallow transitions
      this.classList.remove('dragger_transitions');
      // show some grid lines and dragger_info box
      make_grid();
      this.dragger_info = document.getElementById('dragger_info');
    },
    drag: function (event, ui) {
      // dynamic percentage defined by the dragger in relation to the inner window
      this.percentage_wide = ui.position.left / inner_width;
      // display the percentages in the dragger_info div
      this.dragger_info.textContent = 'opacity:' + (this.percentage_wide * 100).toFixed(0) +  '%';
      // make the calculated changes
      this.image_element.style.opacity = this.percentage_wide;
      // socket to other clients
      this.socketdata.imageOpacity = this.percentage_wide;
      socket.emit('c-e:  opacity_changing', this.socketdata);
    },
    stop: function () {
      // remove grid and dragger_info box
      remove_grid();
      // allow transitions
      this.classList.add('dragger_transitions');
      // show draggers
      set_dragger_locations(this.image_id);
      // save to database
      this.socketdata.imageFilename  = this.image_element.getAttribute('title');
      socket.emit('c-e:  store_opacity', this.socketdata);
      // reset click count
      click_count = 0;
    }
  });

  $('#rotation_dragger').draggable({
    containment: 'parent',
    scroll: false,
    start: function () {
      // hide other draggers
      stateChange.hideOtherDraggers(this.getAttribute('id'));
      // prepare dom elements for manipulation
      this.image_id      = store.getState().selectedImage.id;
      this.image_element = document.getElementById(store.getState().selectedImage.id);
      // prepare the socketdata
      this.socketdata = {};
      this.socketdata.image_id = this.image_id;

      // show some grid lines and dragger_info box
      make_grid();
      this.dragger_info = document.getElementById('dragger_info');
      // disallow transitions
      this.classList.remove('dragger_transitions');
      // put the filter in a data attribute and remove filter
      // this.image_element.setAttribute('data-filter', this.image_element.style.WebkitFilter);
      // this.image_element.style.WebkitFilter = '';
      // socket to other clients
      // socket.emit('c-e:  remove_filter', this.image_id);
    },
    drag: function (event, ui) {
      // calculate changes: define the selected_image's new rotation in relation to the percentage of inner window size
      this.new_rotation = Math.round(ui.position.left / inner_width * 100) * 3.6;
      this.new_rotateZ = Math.round(ui.position.top / inner_height * 100) * 3.6;

      // display the percentages in the dragger_info div
      this.dragger_info.textContent = 'rotation: ' + this.new_rotation.toFixed(2) + 'deg   rotateZ: ' + this.new_rotateZ.toFixed(2) + 'deg';
      // make the calculated changes
      this.image_element.style.transform = this.image_element.style.transform.replace(/rotate\(.*?\)/      , 'rotate(' + this.new_rotation + 'deg)');
      this.image_element.style.transform = this.image_element.style.transform.replace(/rotateZ\(.*?\)/      , 'rotateZ(' + this.new_rotateZ + 'deg)');

      // socket to other clients
      this.socketdata.imageTransform = this.image_element.style.transform;
      socket.emit('c-e:  transforming', this.socketdata);
    },
    stop: function () {
      // remove grid and dragger_info box
      remove_grid();
      // allow transitions
      this.classList.add('dragger_transitions');
      // restore filter
      // this.image_element.style.WebkitFilter = this.image_element.getAttribute('data-filter');
      // this.image_element.removeAttribute('data-filter');
      // socket.emit('c-e:  restore_filter', this.image_id);
      // save to database
      this.socketdata.imageFilename  = this.image_element.getAttribute('title');
      // this.socketdata.imageTransform = this.image_element.style.transform;
      socket.emit('c-e:  store_transformed', this.socketdata);
      // store angle in data-angle
      this.image_element.setAttribute('data-angle', this.new_rotation.toFixed(2));
      this.image_element.setAttribute('data-rotateZ', this.new_rotateZ.toFixed(2));
      // show draggers
      set_dragger_locations(this.image_id);
      // send to socket
      this.socketdata.angle = this.new_rotation.toString();
      this.socketdata.scale = this.image_element.getAttribute('data-scale');
      this.socketdata.rotateX = this.image_element.getAttribute('data-rotateX');
      this.socketdata.rotateY = this.image_element.getAttribute('data-rotateY');
      this.socketdata.rotateZ = this.image_element.getAttribute('data-rotateZ');
      socket.emit('c-e:  store_data_attributes', this.socketdata);
      // reset click count
      click_count = 0;
    }
  });

  $('#grayscale_invert_dragger').draggable({
    containment: 'parent',
    scroll: false,
    start: function () {
      // hide other draggers
      stateChange.hideOtherDraggers(this.getAttribute('id'));
      // prepare dom elements for manipulation
      this.image_id      = store.getState().selectedImage.id;
      this.image_element = document.getElementById(store.getState().selectedImage.id);
      // prepare the socketdata
      this.socketdata = {};
      this.socketdata.image_id = this.image_id;
      // gather selected_image stats
      this.image_original_filter = this.image_element.style.WebkitFilter;
      // show some grid lines and dragger_info box
      make_grid();
      this.dragger_info = document.getElementById('dragger_info');
      // disallow transitions
      this.classList.remove('dragger_transitions');
    },
    drag: function (event, ui) {
      // dynamic percentage defined by the dragger in relation to the inner window
      this.percentage_wide = ui.position.left / inner_width;
      this.percentage_high = (inner_height - ui.position.top) / inner_height;
      // display the percentages in the dragger_info div
      this.dragger_info.textContent = 'grayscale: ' + (this.percentage_high * 100).toFixed(0) + '% invert:' + (this.percentage_wide * 100).toFixed(0) + '%';
      // make the calculated changes and use regex to replace
      this.image_element.style.WebkitFilter = this.image_element.style.WebkitFilter.replace(/invert\(.*?\)/   , 'invert('    + this.percentage_wide + ')');
      this.image_element.style.WebkitFilter = this.image_element.style.WebkitFilter.replace(/grayscale\(.*?\)/, 'grayscale(' + this.percentage_high + ')');
      // socket to other clients
      this.socketdata.imageFilter = this.image_element.style.WebkitFilter;
      socket.emit('c-e:  filter_changing', this.socketdata);
    },
    stop: function () {
      // remove grid and dragger_info box
      remove_grid();
      // allow transitions
      this.classList.add('dragger_transitions');
      // show draggers
      set_dragger_locations(this.image_id);
      // save to database
      this.socketdata.imageFilename  = this.image_element.getAttribute('title');
      socket.emit('c-e:  store_filter', this.socketdata);
      // reset click count
      click_count = 0;
    }
  });

  $('#blur_brightness_dragger').draggable({
    containment: 'parent',
    scroll: false,
    start: function () {
      // hide other draggers
      stateChange.hideOtherDraggers(this.getAttribute('id'));
      // prepare dom elements for manipulation
      this.image_id      = store.getState().selectedImage.id;
      this.image_element = document.getElementById(store.getState().selectedImage.id);
      // prepare the socketdata
      this.socketdata = {};
      this.socketdata.image_id = this.image_id;
      // gather selected_image stats
      this.image_original_filter = this.image_element.style.WebkitFilter;
      // show some grid lines and dragger_info box
      make_grid();
      this.dragger_info = document.getElementById('dragger_info');
      // disallow transitions
      this.classList.remove('dragger_transitions');
    },
    drag: function (event, ui) {
      // dynamic percentage defined by the dragger in relation to the inner window
      this.percentage_wide = ui.position.left / inner_width;
      this.percentage_high = (inner_height - ui.position.top) / inner_height;
      // display the percentages in the dragger_info div
      this.dragger_info.textContent = 'blur:' + ((1 - this.percentage_high) * config.blurLevel).toFixed(2) + 'px brightness: ' + (this.percentage_wide * config.brightnessLevel).toFixed(2);
      // make the calculated changes
      this.image_element.style.WebkitFilter = this.image_element.style.WebkitFilter.replace(/blur\(.*?\)/      , 'blur(' + ((1 - this.percentage_high) * config.blurLevel) + 'px)');
      this.image_element.style.WebkitFilter = this.image_element.style.WebkitFilter.replace(/brightness\(.*?\)/, 'brightness(' + (this.percentage_wide * config.brightnessLevel) + ')');
      // socket to other clients
      this.socketdata.imageFilter = this.image_element.style.WebkitFilter;
      socket.emit('c-e:  filter_changing', this.socketdata);
    },
    stop: function () {
      // remove grid and dragger_info box
      remove_grid();
      // allow transitions
      this.classList.add('dragger_transitions');
      // show draggers
      set_dragger_locations(this.image_id);
      // save to database
      this.socketdata.imageFilename  = this.image_element.getAttribute('title');
      socket.emit('c-e:  store_filter', this.socketdata);
      // reset click count
      click_count = 0;
    }
  });

  $('#contrast_saturate_dragger').draggable({
    containment: 'parent',
    scroll: false,
    start: function () {
      // hide other draggers
      stateChange.hideOtherDraggers(this.getAttribute('id'));
      // prepare dom elements for manipulation
      this.image_id      = store.getState().selectedImage.id;
      this.image_element = document.getElementById(store.getState().selectedImage.id);
      // prepare the socketdata
      this.socketdata = {};
      this.socketdata.image_id = this.image_id;
      // gather selected_image stats
      this.image_original_filter = this.image_element.style.WebkitFilter;
      // show some grid lines and dragger_info box
      make_grid();
      this.dragger_info = document.getElementById('dragger_info');
      // disallow transitions
      this.classList.remove('dragger_transitions');
    },
    drag: function (event, ui) {
      // dynamic percentage defined by the dragger in relation to the inner window
      this.percentage_wide = ui.position.left / inner_width;
      this.percentage_high = (inner_height - ui.position.top) / inner_height;
      // display the percentages in the dragger_info div
      this.dragger_info.textContent = 'contrast:' + ((1 - this.percentage_high) * config.contrastLevel).toFixed(2) +  ' saturate: ' + (this.percentage_wide * config.saturateLevel).toFixed(2);
      // make the calculated changes
      this.image_element.style.WebkitFilter = this.image_element.style.WebkitFilter.replace(/contrast\(.*?\)/      , 'contrast(' + ((1 - this.percentage_high) * config.contrastLevel) + ')');
      this.image_element.style.WebkitFilter = this.image_element.style.WebkitFilter.replace(/saturate\(.*?\)/, 'saturate(' + (this.percentage_wide * config.saturateLevel) + ')');
      // socket to other clients
      this.socketdata.imageFilter = this.image_element.style.WebkitFilter;
      socket.emit('c-e:  filter_changing', this.socketdata);
    },
    stop: function () {
      // remove grid and dragger_info box
      remove_grid();
      // allow transitions
      this.classList.add('dragger_transitions');
      // show draggers
      set_dragger_locations(this.image_id);
      // save to database
      this.socketdata.imageFilename  = this.image_element.getAttribute('title');
      socket.emit('c-e:  store_filter', this.socketdata);
      // reset click count
      click_count = 0;
    }
  });

  $('#party_dragger').draggable({
    containment: 'parent',
    scroll: false,
    start: function () {
      // hide other draggers
      stateChange.hideOtherDraggers(this.getAttribute('id'));
      // prepare dom elements for manipulation
      this.image_id      = store.getState().selectedImage.id;
      this.image_element = document.getElementById(store.getState().selectedImage.id);
      // prepare the socketdata
      this.socketdata = {};
      this.socketdata.image_id = this.image_id;
      // show some grid lines and dragger_info box
      make_grid();
      this.dragger_info = document.getElementById('dragger_info');
      // disallow transitions
      this.classList.remove('dragger_transitions');
    },
    drag: function (event, ui) {
      // dynamic percentage defined by the dragger in relation to the inner window
      this.percentage_wide = ui.position.left / inner_width;
      this.percentage_high = (inner_height - ui.position.top) / inner_height;
      // calculate changes
      this.new_opacity = this.percentage_wide;
      this.new_hue_rotate = Math.round(this.percentage_high * 100) * 3.6;
      // display the percentages in the dragger_info div
      this.dragger_info.textContent = 'opacity: ' + Math.round(this.new_opacity * 100) + '%   hue-rotation: ' + this.new_hue_rotate.toFixed(2);
      // make the calculated changes
      this.image_element.style.opacity = this.new_opacity;
      this.image_element.style.WebkitFilter = this.image_element.style.WebkitFilter.replace(/hue-rotate\(.*?\)/      , 'hue-rotate(' + this.new_hue_rotate + 'deg)');
      // socket to other clients
      this.socketdata.imageOpacity = this.percentage_wide;
      this.socketdata.imageFilter = this.image_element.style.WebkitFilter;
      socket.emit('c-e:  opacity_changing', this.socketdata);
      socket.emit('c-e:  filter_changing', this.socketdata);
    },
    stop: function () {
      // remove grid and dragger_info box
      remove_grid();
      // allow transitions
      this.classList.add('dragger_transitions');
      // show draggers
      set_dragger_locations(this.image_id);
      // save to database
      this.socketdata.imageFilename  = this.image_element.getAttribute('title');
      this.socketdata.image_id = this.image_id;
      socket.emit('c-e:  store_opacity', this.socketdata);
      socket.emit('c-e:  store_filter', this.socketdata);
      // reset click count
      click_count = 0;
    }
  });

  $('#threeD_dragger').draggable({
    containment: 'parent',
    scroll: false,
    start: function () {
      // hide other draggers
      stateChange.hideOtherDraggers(this.getAttribute('id'));
      // prepare dom elements for manipulation
      this.image_id      = store.getState().selectedImage.id;
      this.image_element = document.getElementById(store.getState().selectedImage.id);

      // prepare the socketdata
      this.socketdata = {};
      this.socketdata.image_id = this.image_id;
      // show some grid lines and dragger_info box
      make_grid();
      this.dragger_info = document.getElementById('dragger_info');
      // disallow transitions
      this.classList.remove('dragger_transitions');
    },
    drag: function (event, ui) {
      // dynamic percentage defined by the dragger in relation to the inner window
      this.percentage_wide = ui.position.left / inner_width;
      this.percentage_high = (inner_height - ui.position.top) / inner_height;
      // calculate changes
      this.new_rotate_x = (Math.round(this.percentage_high * 100) * 3.6) - 180;
      this.new_rotate_y = (Math.round(this.percentage_wide * 100) * 3.6) - 180;

      // display the percentages in the dragger_info div
      this.dragger_info.textContent = 'rotateX: ' + this.new_rotate_x.toFixed(2) + 'deg   rotateY: ' + this.new_rotate_y.toFixed(2) + 'deg';
      // make the calculated changes
      this.image_element.style.transform = this.image_element.style.transform.replace(/rotateX\(.*?\)/      , 'rotateX(' + this.new_rotate_x + 'deg)');
      this.image_element.style.transform = this.image_element.style.transform.replace(/rotateY\(.*?\)/      , 'rotateY(' + this.new_rotate_y + 'deg)');

      // socket to other clients
      this.socketdata.imageTransform = this.image_element.style.transform;
      socket.emit('c-e:  transforming', this.socketdata);
    },
    stop: function () {
      // remove grid and dragger_info box
      remove_grid();
      // allow transitions
      this.classList.add('dragger_transitions');
      // save to database
      this.socketdata.imageFilename  = this.image_element.getAttribute('title');
      this.socketdata.image_id = this.image_id;
      socket.emit('c-e:  store_transformed', this.socketdata);
      // store rotate in data-rotateX,Y
      this.image_element.setAttribute('data-rotateX', this.new_rotate_x.toFixed(2));
      this.image_element.setAttribute('data-rotateY', this.new_rotate_y.toFixed(2));
      // show draggers
      set_dragger_locations(this.image_id);

      // send to socket
      this.socketdata.scale = this.image_element.getAttribute('data-scale');
      this.socketdata.angle = this.image_element.getAttribute('data-angle');
      this.socketdata.rotateX = this.image_element.getAttribute('data-rotateX');
      this.socketdata.rotateY = this.image_element.getAttribute('data-rotateY');
      this.socketdata.rotateZ = this.image_element.getAttribute('data-rotateZ');
      socket.emit('c-e:  store_data_attributes', this.socketdata);
      // reset click count
      click_count = 0;
    }
  });

// --Set dragger locations

  function set_dragger_locations(id) {

    if (id) {
      if (document.getElementById('stretch_dragger_switch').classList.contains('switchon')) {
        set_stretch_dragger_to(id);
      };
      if (document.getElementById('opacity_dragger_switch').classList.contains('switchon')) {
        set_opacity_dragger_to(id);
      };
      if (document.getElementById('rotation_dragger_switch').classList.contains('switchon')) {
        set_rotation_dragger_to(id);
      };
      if (document.getElementById('grayscale_invert_dragger_switch').classList.contains('switchon')) {
        set_grayscale_invert_dragger_to(id);
      };
      if (document.getElementById('blur_brightness_dragger_switch').classList.contains('switchon')) {
        set_blur_brightness_dragger_to(id);
      };
      if (document.getElementById('contrast_saturate_dragger_switch').classList.contains('switchon')) {
        set_contrast_saturate_dragger_to(id);
      };
      if (document.getElementById('threeD_dragger_switch').classList.contains('switchon')) {
        set_threeD_dragger_to(id);
      };
      if (document.getElementById('party_dragger_switch').classList.contains('switchon')) {
        set_party_dragger_to(id);
      };
    };
  };

  function set_stretch_dragger_to(id) {
    var dragger_element = document.getElementById('stretch_dragger'),
        image_element     = document.getElementById(id),
        // get the width and height
        selected_imageWidth  = parseInt(image_element.style.width),
        selected_imageHeight = parseInt(image_element.style.height),
        // calculate the dragger location
        selected_imageWidth_percentage  = selected_imageWidth / mainwide,
        selected_imageHeight_percentage = selected_imageHeight / mainhigh,
        dragger_location_left            = selected_imageWidth_percentage * inner_width,
        dragger_location_top             = (1 - selected_imageHeight_percentage) * inner_height;

    // set the dragger location
    dragger_element.style.left    = dragger_location_left + 'px';
    dragger_element.style.top     = dragger_location_top + 'px';
    dragger_element.style.display = 'block';
    // allow transitions
    // setTimeout is needed because the dragger will otherwise transition from no selection to selection
    setTimeout(function () {
      dragger_element.classList.add('dragger_transitions');
    }, 0);
  };

  function set_opacity_dragger_to(id) {
    var dragger_element = document.getElementById('opacity_dragger'),
        image_element = document.getElementById(id),
        // get the opacity percentage: 0-1
        selected_image_opacity = parseInt( image_element.style.opacity * 100) / 100,
        // calculate the dragger location
        dragger_location_left = (selected_image_opacity * inner_width);

    // set the dragger location
    dragger_element.style.left    = dragger_location_left + 'px';
    dragger_element.style.top     = (inner_height / 3 * 2) + 'px';
    dragger_element.style.display = 'block';
    // allow transitions
    setTimeout(function () {
      dragger_element.classList.add('dragger_transitions');
    }, 0);
  };

  function set_rotation_dragger_to(id) {
    var dragger_element = document.getElementById('rotation_dragger'),
      image_element = document.getElementById(id),
      // calculate the dragger location
      dragger_location_left = parseFloat(image_element.getAttribute('data-angle') / 360 * inner_width),
      dragger_location_top = parseFloat(image_element.getAttribute('data-rotateZ') / 360 * inner_height);

    // set the dragger location
    dragger_element.style.left    = dragger_location_left + 'px';
    dragger_element.style.top     = dragger_location_top + 'px';
    dragger_element.style.display = 'block';
    // allow transitions
    setTimeout(function () {
      dragger_element.classList.add('dragger_transitions');
    }, 0);
  };

  function set_grayscale_invert_dragger_to(id) {
    var dragger_element = document.getElementById('grayscale_invert_dragger'),
        image_element = document.getElementById(id),
        // get the filter. example: ('grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)')
        selected_image_filter = image_element.style.WebkitFilter,
        // get the numbers within the grayscale and invert parentheses
        grayscale_Exp = /grayscale\(([^)]+)\)/,
        invert_Exp = /invert\(([^)]+)\)/,
        grayscale_matches = grayscale_Exp.exec(selected_image_filter),
        invert_matches    = invert_Exp.exec(selected_image_filter),
        // calculate the dragger location
        dragger_location_top = ((1 - parseFloat(grayscale_matches[1])) * inner_height),
        dragger_location_left = (parseFloat(invert_matches[1]) * inner_width);

    // set the dragger location
    dragger_element.style.left    = dragger_location_left + 'px';
    dragger_element.style.top     = dragger_location_top + 'px';
    dragger_element.style.display = 'block';
    // allow transitions
    setTimeout(function () {
      dragger_element.classList.add('dragger_transitions');
    }, 0);
  };

  function set_blur_brightness_dragger_to(id) {
    var dragger_element = document.getElementById('blur_brightness_dragger'),
        image_element = document.getElementById(id),
        // get the filter. example: ('grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)')
        selected_image_filter = image_element.style.WebkitFilter,
        // get the numbers within the blur and brightness parentheses
        blur_Exp = /blur\(([^)]+)\)/,
        brightness_Exp = /brightness\(([^)]+)\)/,
        blur_matches = blur_Exp.exec(selected_image_filter),
        brightness_matches    = brightness_Exp.exec(selected_image_filter),
        // calculate the dragger location
        dragger_location_top = (parseFloat(blur_matches[1]) * inner_height / config.blurLevel),
        dragger_location_left = (parseFloat(brightness_matches[1]) * inner_width / config.brightnessLevel);

    // set the dragger location
    dragger_element.style.left    = dragger_location_left + 'px';
    dragger_element.style.top     = dragger_location_top + 'px';
    dragger_element.style.display = 'block';
    // allow transitions
    setTimeout(function () {
      dragger_element.classList.add('dragger_transitions');
    }, 0);
  };

  function set_contrast_saturate_dragger_to(id) {
    var dragger_element = document.getElementById('contrast_saturate_dragger'),
        image_element = document.getElementById(id),
        // get the filter. example: ('grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)')
        selected_image_filter = image_element.style.WebkitFilter,
        // get the numbers within the contrast and saturate parentheses
        contrast_Exp = /contrast\(([^)]+)\)/,
        saturate_Exp = /saturate\(([^)]+)\)/,
        contrast_matches = contrast_Exp.exec(selected_image_filter),
        saturate_matches = saturate_Exp.exec(selected_image_filter),
        // calculate the dragger location
        dragger_location_top = (parseFloat(contrast_matches[1]) * inner_height / config.contrastLevel),
        dragger_location_left = (parseFloat(saturate_matches[1]) * inner_width / config.saturateLevel);

    // set the dragger location
    dragger_element.style.left    = dragger_location_left + 'px';
    dragger_element.style.top     = dragger_location_top + 'px';
    dragger_element.style.display = 'block';
    // allow transitions
    setTimeout(function () {
      dragger_element.classList.add('dragger_transitions');
    }, 0);
  };

  function set_party_dragger_to(id) {
    var dragger_element = document.getElementById('party_dragger'),
        image_element = document.getElementById(id),
        // get the filter. example: ('grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)')
        // and opacity percentage: (0-1)
        selected_image_filter = image_element.style.WebkitFilter,
        selected_image_opacity = parseInt( image_element.style.opacity * 100) / 100,
        // get the number within the hue-rotation parentheses
        hue_rotate_Exp = /hue-rotate\(([^)]+)\)/,
        hue_rotate_matches = hue_rotate_Exp.exec(selected_image_filter),
        // calculate the dragger location
        dragger_location_left = (selected_image_opacity * inner_width),
        dragger_location_top = (inner_height - (parseFloat(hue_rotate_matches[1]) / 360 * inner_height));

    // set the dragger location
    dragger_element.style.left    = dragger_location_left + 'px';
    dragger_element.style.top     = dragger_location_top + 'px';
    dragger_element.style.display = 'block';
    // allow transitions
    setTimeout(function () {
      dragger_element.classList.add('dragger_transitions');
    }, 0);
  };

  function set_threeD_dragger_to(id) {
    var dragger_element = document.getElementById('threeD_dragger'),
      image_element = document.getElementById(id),
      // calculate the dragger location
      dragger_location_top = inner_height - ((( 180 + parseFloat(image_element.getAttribute('data-rotateX')) ) / 360) * inner_height),
      dragger_location_left = (( 180 + parseFloat(image_element.getAttribute('data-rotateY')) ) / 360) * inner_width;

    // set the dragger location
    dragger_element.style.left    = dragger_location_left + 'px';
    dragger_element.style.top     = dragger_location_top + 'px';
    dragger_element.style.display = 'block';
    // allow transitions
    setTimeout(function () {
      dragger_element.classList.add('dragger_transitions');
    }, 0);
  };
