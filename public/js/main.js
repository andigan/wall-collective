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

$(document).ready( function () {

// --Development helpers

  // setTimeout(function () { $( '#debug_button' ).trigger( 'click' ); }, 0);
  // setTimeout(function () { $( '#explore_button' ).trigger( 'click' ); }, 0);
  // setTimeout(function () { $( '#upload_container_button').trigger( 'click' ); }, 1000);

  // setTimeout(function () { $( '#dragger_switches_button' ).trigger( 'click' ); }, 0);
  // setTimeout(function() { $('#wrapper').css('background-color', 'yellow'); },1500);

// --Setup and configure variables

  // set socket location : io.connect('http://localhost:8000'); || io.connect('http://www.domain_name.com');
  var socket = io.connect([location.protocol, '//', location.host, location.pathname].join('')),

    // set debug box on or off
    debug_on = true,

    // set upload placement
    upload_top = '0px',
    upload_left = '0px',
    upload_width = '75px',
    upload_height = '100px',

    // set maximum limit for draggers
    blur_level = 7,
    brightness_level = 8,
    contrast_level = 10,
    saturate_level = 10,

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

    // assigned when an image is dragged onto the exit_door icon; used by delete_button
    image_to_delete = {},

    // assigned by initial socket
    image_dir = String,

    // assigned by initial socket; used by upload counter
    client_id = String,

    // assigned by initial socket; used by instagram link
    insta_app_id = String,

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
    insta_access_ready = false;

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
  document.getElementById('close_info_container').style.top = (mainhigh * .05) + (parseFloat(window.getComputedStyle(document.getElementById('app_info')).height) - parseInt(document.getElementById('close_info_container').style.height)) + 'px';

  // set position and size of the x_icon container divs
  document.getElementById('close_explore_container').style.width = (parseFloat(window.getComputedStyle(document.getElementById('app_info')).height) * 0.1) + 'px';
  document.getElementById('close_explore_container').style.height = (parseFloat(window.getComputedStyle(document.getElementById('app_info')).height) * 0.1) + 'px';
  document.getElementById('close_explore_container').style.top = (mainhigh * .05) + (parseFloat(window.getComputedStyle(document.getElementById('app_info')).height) - parseInt(document.getElementById('close_explore_container').style.height)) + 'px';


  // add perspective to 3d transforms
  document.getElementById('images').style.width = window.innerWidth + 'px';
  document.getElementById('images').style.height = window.innerHeight + 'px';
  document.getElementById('images').style.webkitPerspective = '500px';
  document.getElementById('images').style.webkitPerspectiveOriginX = '50%';
  document.getElementById('images').style.webkitPerspectiveOriginY = '50%';

  // position the navigation_toggle_button_container on the bottom on startup.
//  document.getElementById('navigation_toggle_button_container').style.left = (mainwide - parseFloat(window.getComputedStyle(document.getElementById('navigation_toggle_button_container')).width) + 'px');
  document.getElementById('navigation_toggle_button_container').style.left = (mainwide - $('#navigation_toggle_button_container').width()) + 'px';


  // assign draggable to all .drawing elements
  assigndrag();


  // insta_step 6: Open the instagram_div and fetch instagram data
  if (open_instagram_div === true) {
    socket.emit('get_instagram_data');

    document.getElementById('insta_header').style.display = 'flex';
    document.getElementById('insta_div').style.display = 'block';
    document.body.classList.add('button_container_is_open');

    // animate open hamburgers
    document.getElementById('line_one').style.top = '35%';
    document.getElementById('line_three').style.top = '65%';
  };


// --Debug functions

  // create debug box, make it draggable
  if (debug_on) create_debug_box();

  function create_debug_box() {
    // <div id='debug_box' style='display: none;'>
    //   <div id='info1'> </div> ... <div id='info10'> </div>
    // </div>
    var i = 0,
      info_element = {},
      wrapper_element = document.getElementById('wrapper'),
      debug_box_element = document.createElement('div');

    debug_box_element.setAttribute('id', 'debug_box');
    debug_box_element.style.display = 'none';
    for (i = 1; i <= 10; i++) {
      info_element = document.createElement('div');
      info_element.setAttribute('id', 'info' + i);
      info_element.classList.add('info');
      debug_box_element.appendChild(info_element);
    };
    // add 'debug_box' to 'wrapper'
    wrapper_element.appendChild(debug_box_element);

    // make debug_box draggable
    $('#debug_box').draggable({
      containment: 'parent',
      start: function () {
        clear_debug_box();
        debug_report([[1, 'this div width: ' + $('#debug_box').css('width')],
                      [2, 'wrapper width     :' + $('#wrapper').css('width')],
                      [3, 'screen.width      :' + screen.width.toString()],
                      [4, 'window.innerWidth :' + window.innerWidth.toString()],
                      [5, 'screen.availWidth :' + screen.availWidth.toString()]]);
      },
      drag: function () {
        var debug_box_element = document.getElementById ('debug_box'),
          debug_box_coords = debug_box_element.getBoundingClientRect();

        debug_report([[6, ' '],
                      [7, $(this).css('left') + ' <css> ' + $(this).css('right')],
                      [8, debug_box_coords.left.toString() + ' <dom> ' + debug_box_coords.right.toString()]]);
      }
    }); // end of debug_box draggable
  } // end of create_debug_box()

  // used to post debug information to the debug box
  // debug_strings is a multidimensional array with number from 1-10 and report strings [[1, string], [2, string]];
  function debug_report(debug_strings) {
    var i = 0;

    if (debug_on) {
      for (i = 0; i < debug_strings.length; i++) {
        document.getElementById('info' + debug_strings[i][0]).textContent = debug_strings[i][1];
      };
    };
  }

  function clear_debug_box() {
    var i = 0,
      info_elements = {};

    if (debug_on) {
      info_elements = document.getElementsByClassName('info');
      for (i = 0; i < info_elements.length; i++) {
        info_elements[i].textContent = '';
      };
    };
  }


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
      hide_draggers();
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

    clear_debug_box();
    debug_report([[1, 'resize: new width : ' + window.innerWidth + 'px'],
                  [2, 'resize: new height : ' + window.innerHeight + 'px']]);
  }, false); // bubbling phase

  // hide all draggers
  function hide_draggers() {
    var dragger_elements = document.getElementsByClassName('dragger'),
      i = 0;

    for (i = 0; i < dragger_elements.length; i++) {
      dragger_elements[i].style.display = 'none';
    };
  }

  // hide all draggers except the one being dragged
  function hide_other_draggers(id) {
    var dragger_elements = document.getElementsByClassName('dragger'),
      i = 0;

    for (i = 0; i < dragger_elements.length; i++) {
      if (dragger_elements[i].getAttribute('id') !== id) {
        dragger_elements[i].style.display = 'none';
      };
    };
  };

  // used by delete image button
  function clear_selected_file() {
    selected_file.image_id        = '';
    selected_file.image_filename  = '';
    selected_file.src             = '';
    selected_file.width           = '';
    selected_file.height          = '';
    selected_file.transform       = '';
    selected_file.zindex          = '';
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
      // create an array of key=value pairs e.g. ['name=Shannon', 'client_id=Vy94J6V1W']
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


// --State Change functions
//     functions to change the state of the containers and buttons in response to drags, uploads, etc

  function state_change_to_close_all() {
    // hide elements
    document.getElementById('navigation_container').classList.remove('navigation_container_is_open');
    document.getElementById('upload_preview_container').classList.remove('upload_preview_container_is_open');
    document.getElementById('delete_preview_container').classList.remove('delete_preview_container_is_open');
    document.getElementById('dragger_switches_container').classList.remove('dragger_switches_container_is_open');
    document.getElementById('tools_container').classList.remove('tools_container_is_open');
    document.getElementById('login_container').classList.remove('login_container_is_open');
    document.getElementById('upload_container').classList.remove('upload_container_is_open');
    document.getElementById('connect_info').classList.remove('connect_info_is_open');
    document.getElementById('explore_container').style.display = 'none';

    // replace image_upload_preview image and delete_preview image
    document.getElementById('image_upload_preview').src = '/icons/1x1.png';
    document.getElementById('delete_preview').src = '/icons/1x1.png';
    // close navigation button
    document.body.classList.remove('button_container_is_open');
    // animate close hamburgers
    document.getElementById('line_one').style.top = '40%';
    document.getElementById('line_three').style.top = '60%';

    // remove
    // if (document.getElementById('insta_div').style.display === 'block') {
    //   history.replaceState({}, 'wall-collective', '/');
    //   document.getElementById('insta_header').style.display = 'none';
    //   document.getElementById('insta_div').style.display = 'none';
    // };
  }

  function state_change_to_tools_menu() {
    // show element
    document.getElementById('tools_container').classList.add('tools_container_is_open');
    // hide elements
    document.getElementById('navigation_container').classList.remove('navigation_container_is_open');
    document.getElementById('dragger_switches_container').classList.remove('dragger_switches_container_is_open');
  }

  function state_change_to_account_menu() {
    // show element
    document.getElementById('login_container').classList.add('login_container_is_open');
    // hide elements
    document.getElementById('navigation_container').classList.remove('navigation_container_is_open');
  }

  function state_change_to_upload_menu() {
    // show element
    document.getElementById('upload_container').classList.add('upload_container_is_open');
    // hide elements
    document.getElementById('navigation_container').classList.remove('navigation_container_is_open');
  }

  function state_change_to_upload() {
    // hide element
    document.getElementById('navigation_container').classList.remove('navigation_container_is_open');
  }

  function state_change_after_upload() {
    // show element
    document.getElementById('navigation_container').classList.add('navigation_container_is_open');
    // hide elements
    document.getElementById('upload_container').classList.remove('upload_container_is_open');
    document.getElementById('upload_preview_container').style.display = 'none';
    document.getElementById('upload_preview_container').classList.remove('upload_preview_container_is_open');
    document.getElementById('confirm_or_reject_container_info').textContent = '';
    // This setTimeout is so that the upload_preview_container disappears immediately, and then resets
    // to visible after the transition effect takes place
    setTimeout(function () {
      document.getElementById('upload_preview_container').style.display = 'block';
      document.getElementById('confirm_or_reject_container').style.display = 'flex';
    }, 500);
    // replace image_upload_preview image
    document.getElementById('image_upload_preview').src = '/icons/1x1.png';
  }

  function state_change_to_delete() {
    // show elements
    document.getElementById('delete_preview_container').classList.add('delete_preview_container_is_open');
    document.getElementById('delete_preview').src = image_to_delete.src;
    // hide element
    document.getElementById('navigation_container').classList.remove('navigation_container_is_open');
  }

  function state_change_after_delete() {
    // show element
    document.getElementById('navigation_container').classList.add('navigation_container_is_open');
    // hide elements
    document.getElementById('delete_preview_container').style.display = 'none';
    document.getElementById('delete_preview_container').classList.remove('delete_preview_container_is_open');
    hide_draggers();
    // This setTimeout is so that the delete_preview_container disappears immediately, and then resets
    // to visible after the transition effect takes place
    setTimeout(function () {
      document.getElementById('delete_preview_container').style.display = 'block';
    }, 500);
    // replace delete_preview
    document.getElementById('delete_preview').src = '/icons/1x1.png';
  }

  function state_change_after_reject_delete() {
    var data = {};

    // show element
    document.getElementById('navigation_container').classList.add('navigation_container_is_open');
    // hide elements
    document.getElementById('delete_preview_container').style.display = 'none';
    document.getElementById('delete_preview_container').classList.remove('delete_preview_container_is_open');
    setTimeout(function () {
      document.getElementById('delete_preview_container').style.display = 'block';
    }, 500);
    // reshow hidden image that wasn't deleted
    document.getElementById(image_to_delete.image_id).style.display = 'block';
    // show image on other clients
    data.image_id = image_to_delete.image_id;
    socket.emit('clientemit_show_image', data);
  }


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
//     socket.on('broadcast_name', function(data) {
//       use data
//     });


  // on initial connect, retrieve client_id cookie and send results to server
  socket.on('connect', function () {
    var client_vars = {};

    client_vars.client_id = getCookie('client_id');
    socket.emit ('clientemit_client_id_check', client_vars);

  });


  // used to see instagram results
  socket.on('check_out', function (data) {
    console.log(data);
  });


  socket.on('insta_access_ready', function () {
    insta_access_ready = true;
  });

  // initial set up for all visits.
  socket.on('connect_set_client_vars', function (client_vars) {
    var i = 0,
      switches = ['stretch', 'rotation', 'opacity', 'blur_brightness', 'contrast_saturate', 'grayscale_invert', 'threeD', 'party'];

    // assign the image directory from config.js
    image_dir = client_vars.image_dir;

    // assign client_id.  used by upload_counter and user_count
    // the server sends a unique id or the previous id from the cookie
    client_id = client_vars.client_id;

    insta_app_id = client_vars.insta_app_id;

//    insta_access_ready = client_vars.clients_insta_access_ready;

    // set or reset client_id cookie
    setCookie('client_id', client_id, 7);

    // hack: Problem:  busboy stream received the file stream before the client_id, which was passed as a data value in the ajax submit
    //       Solution: change the HTML 'name' attribute of the form's input to the client_id, which always arrives concurrently
    document.getElementById('fileselect').setAttribute('name', client_id);

    // switches_status cookie stores which draggers are activated when the page loads; capital letters denote an activated dragger
    if (getCookie('switches_status') === '') setCookie('switches_status', 'SRObcgtp', 7);

    switches_status = getCookie('switches_status');

    // if the switches_status character is uppercase, switch on the corresponding dragger_switch
    for ( i = 0; i < switches.length; i++ ) {
      if (switches_status[i] === switches_status[i].toUpperCase()) document.getElementById(switches[i] + '_dragger_switch').classList.add('switchon');
    };
  });

  // display the number of connected clients
  socket.on('broadcast_change_user_count', function (data) {
    var i = 0,
      content = '',
      connect_info_element = document.getElementById('connect_info');

    // for each connected_client, add an icon to connect_info element
    for ( i = 0; i < data.length; i++ ) {
      content = content + "<img src='icons/person_icon.png' class='person_icon' />";
      // debug: report client_id rather than image. underline connected client_id
      // if (data[i] === client_id) content = content + '<u>'; content = content + '  ' + data[i]; if (data[i] === client_id) content = content + '</u>';
    };
    connect_info_element.innerHTML = content;
  });

  // on another client moving an image, move target
  socket.on('broadcast_moving', function (data) {
    document.getElementById(data.image_id).style.top  = data.image_top;
    document.getElementById(data.image_id).style.left = data.image_left;
  });

  // on another client resizing an image, resize target
  socket.on('broadcast_resizing', function (data) {
    document.getElementById(data.image_id).style.transform = data.image_transform;
    document.getElementById(data.image_id).style.top       = data.image_top;
    document.getElementById(data.image_id).style.left      = data.image_left;
    document.getElementById(data.image_id).style.width     = data.image_width;
    document.getElementById(data.image_id).style.height    = data.image_height;
  });

  // on resize stop, resize target with new parameters
  socket.on('broadcast_resized', function (data) {
    document.getElementById(data.image_id).style.transform = data.image_transform;
    document.getElementById(data.image_id).style.top       = data.image_top;
    document.getElementById(data.image_id).style.left      = data.image_left;
    document.getElementById(data.image_id).style.width     = data.image_width;
    document.getElementById(data.image_id).style.height    = data.image_height;
  });

  // on transforming, transform target
  socket.on('broadcast_transforming', function (data) {
    document.getElementById(data.image_id).style.transform = data.image_transform;
  });

  // on transform changes, modify data attributes used by set_dragger_locations
  socket.on('broadcast_change_data_attributes', function (data) {
    document.getElementById(data.image_id).setAttribute('data-scale', data.scale);
    document.getElementById(data.image_id).setAttribute('data-angle', data.angle);
    document.getElementById(data.image_id).setAttribute('data-rotateX', data.rotateX);
    document.getElementById(data.image_id).setAttribute('data-rotateY', data.rotateY);
    document.getElementById(data.image_id).setAttribute('data-rotateZ', data.rotateZ);
  });

  // on opacity changing, adjust target
  socket.on('broadcast_opacity_changing', function (data) {
    document.getElementById(data.image_id).style.opacity = data.current_opacity;
  });

  // on filter changing, adjust target
  socket.on('broadcast_filter_changing', function (data) {
    document.getElementById(data.image_id).style.WebkitFilter = data.current_filter;
  });

  // reset page across all clients
  socket.on('broadcast_resetpage', function () {
    window.location.reload(true);
  });

  // add uploaded image
  socket.on('broadcast_add_upload', function (data) {
    var images_element = document.getElementById('images'),
      image_element = document.createElement('img');

    image_element.setAttribute('id', data.dom_id);
    image_element.src = image_dir + data.image_filename;
    image_element.classList.add('drawing');
    image_element.setAttribute('title', data.image_filename);
    image_element.setAttribute('data-scale', '1');
    image_element.setAttribute('data-angle', '0');
    image_element.setAttribute('data-rotateX', '0');
    image_element.setAttribute('data-rotateY', '0');
    image_element.setAttribute('data-rotateZ', '0');
    image_element.style.width = upload_width;
    image_element.style.zIndex = data.z_index;
    image_element.style.top = upload_top;
    image_element.style.left = upload_left;
    image_element.style.opacity = 1;
    image_element.style.WebkitFilter = 'grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)';
    image_element.style.transform = 'rotate(0deg) scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg)';

    // Add <img id='dom_id'> to <div id='images'>
    images_element.appendChild(image_element);
    // assign drag to added element
    assigndrag(data.dom_id);
  });

  // remove deleted image
  socket.on('broadcast_delete_image', function (data) {
    document.getElementById(data.id_to_delete).remove();
    if (data.id_to_delete === selected_file.image_id) {
      clear_selected_file();
      hide_draggers();
    };
  });

  // remove filter
  socket.on('broadcast_remove_filter', function (data) {
    document.getElementById(data).setAttribute('data-filter', document.getElementById(data).style.WebkitFilter);
    document.getElementById(data).style.WebkitFilter = '';
  });
  // replace filter
  socket.on('broadcast_restore_filter', function (data) {
    document.getElementById(data).style.WebkitFilter = document.getElementById(data).getAttribute('data-filter');
    document.getElementById(data).removeAttribute('data-filter');
  });

  // disable dragging; other client is moving image
  socket.on('broadcast_freeze', function (data) {
    $('#' + data).draggable ( 'disable' );
  });
  // enable dragging; other client has stopped moving image
  socket.on('broadcast_unfreeze', function (data) {
    $('#' + data).draggable ( 'enable' );
  });

  // hide element; other client has primed image for deletion
  socket.on('broadcast_hide_image', function (data) {
    document.getElementById(data).style.display = 'none';
  });
  // show element; other client has cancelled deletion
  socket.on('broadcast_show_image', function (data) {
    document.getElementById(data.image_id).style.display = 'block';
  });

  // if this client is the uploader, show upload statistics from busboy
  socket.on('broadcast_chunk_sent', function (uploaddata) {
    if (uploaddata.client_id === client_id) {
      uploadtotal += uploaddata.chunk_size;
      document.getElementById('confirm_or_reject_container_info').textContent = 'Uploaded ' + uploadtotal  + ' bytes of ' + document.getElementById('fileselect').files[0].size + ' bytes.';
      debug_report([[10, 'Uploaded ' + uploadtotal  + ' bytes of ' + document.getElementById('fileselect').files[0].size + ' bytes.']]);
    } else {
      debug_report([[10, 'Someone is uploading an image.']]);
    };
  });

  // insta_step 10: Add content to insta_div
  socket.on('add_content_to_insta_div', function (insta_fetch_data) {
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

            socket.emit('client_emit_save_insta_image', { src: this.getAttribute('src'), id: parseInt(this.getAttribute('id').replace('insta', '')) });

            // assign temporary z-index
            this.style.zIndex = 60000;

            hide_draggers();
          }
        });
    };
  }); // end of socket add_content_to_insta_div


// insta_step 15: Receive new filename from server
socket.on('insta_download_ready', function (new_file) {

  //  store new filename in an object with the id as the key
  insta_download_ready_filename['insta' + new_file.image_index] = new_file.newfilename;

  console.log(new_file.newfilename + ' downloaded.');
});


// insta_step 16: Make dragged insta_image droppable in images_div

// http://stackoverflow.com/questions/36181050/jquery-ui-draggable-and-droppable-duplicate-issue
// This allows the image to be draggable outside of the scrollable div
  $('#images').droppable({
    accept: '.insta_image',
    drop: function (event, ui) {
      var clone = {},
        insta_drop_data = {},
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

        // insta_step 17: Send insta_drop_data to server
        insta_drop_data.insta_id = ui.draggable[0].getAttribute('id');
        insta_drop_data.insta_filename = insta_download_ready_filename[ui.draggable[0].getAttribute('id')];
        insta_drop_data.posleft = ui.offset.left;
        insta_drop_data.postop = ui.offset.top;
        insta_drop_data.insta_width = window.getComputedStyle(ui.draggable[0]).width;
        insta_drop_data.insta_height = window.getComputedStyle(ui.draggable[0]).height;
        insta_drop_data.insta_link = ui.draggable[0].getAttribute('data-link');

        socket.emit('client_emit_insta_drop', insta_drop_data);

        // delete id key from insta_download_ready_filename object
        delete insta_download_ready_filename[ui.draggable[0].getAttribute('id')];
      }

      wait_for_download();

      // It would be much less complex to initiate the download here,
      // however, this strategy (of starting the download when the drag starts)
      // provides a quicker user experience.
    }
  });



  // insta_step 20: Convert dragged image to typical .drawing
  socket.on('change_clone_to_image', function(insta_database_parameters) {
    var image_element = document.getElementById(insta_database_parameters.insta_id);

    image_element.setAttribute('id', insta_database_parameters.dom_id);
    image_element.src = image_dir + insta_database_parameters.insta_filename;
    image_element.classList.add('drawing');
    image_element.style.width = insta_database_parameters.width;
    image_element.style.height = insta_database_parameters.height;
    image_element.classList.remove('insta_image');
    image_element.setAttribute('title', insta_database_parameters.insta_filename);
    image_element.setAttribute('data-link', insta_database_parameters.insta_link);
    image_element.setAttribute('data-scale', '1');
    image_element.setAttribute('data-angle', '0');
    image_element.setAttribute('data-rotateX', '0');
    image_element.setAttribute('data-rotateY', '0');
    image_element.setAttribute('data-rotateZ', '0');
    image_element.style.zIndex = insta_database_parameters.z_index;
    image_element.style.opacity = 1;
    image_element.style.WebkitFilter = 'grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)';
    image_element.style.transform = 'rotate(0deg) scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg)';

    // assign drag to added element
    assigndrag(insta_database_parameters.dom_id);
  });

  // insta_step 22: Add image to other clients
  socket.on('add_insta_image_to_other_clients', function (insta_database_parameters) {
    var images_element = document.getElementById('images'),
      image_element = document.createElement('img');

    image_element.setAttribute('id', insta_database_parameters.dom_id);
    image_element.setAttribute('title', insta_database_parameters.insta_filename);
    image_element.src = image_dir + insta_database_parameters.insta_filename;
    image_element.classList.add('drawing');
    image_element.style.width = insta_database_parameters.width;
    image_element.style.height = insta_database_parameters.height;
    image_element.style.top = insta_database_parameters.postop;
    image_element.style.left = insta_database_parameters.posleft;
    image_element.style.zIndex = insta_database_parameters.z_index;
    image_element.setAttribute('data-link', insta_database_parameters.insta_link);


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
    assigndrag(insta_database_parameters.dom_id);
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
        state_change_to_close_all();
        // show selected_file in case it was removed by being dragged onto the exit door
        // except when no file is selected: selected_file.image_id is undefined or ''
        if ( (typeof selected_file.image_id !== 'undefined') && (selected_file.image_id.length > 0 ) ) {
          document.getElementById(selected_file.image_id).style.display = 'block';
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

        hide_draggers();
      };
    };
  });

  // debug box button
  $('#debug_button').on('click', function () {
    // if debug_box is open, hide it
    if ( document.body.classList.contains('debug_on') ) {
      debug_on = false;
      document.body.classList.remove('debug_on');
      document.getElementById('debug_box').style.display = 'none';
      document.getElementById('debug_button').innerHTML = "report is off <img class='icon_image' src='/icons/debug_icon.png'>";
    // else when debug_box is closed, show it
    } else {
      debug_on = true;
      document.body.classList.add('debug_on');
      document.getElementById('debug_box').style.display = 'block';
      document.getElementById('debug_button').innerHTML = "report is on <img class='icon_image' src='/icons/debug_icon.png'>";
    };
  });

  // tools button
  $('#tools_container_button').on('click', function () {
    state_change_to_tools_menu();
  });

  // login button
  $('#login_container_button').on('click', function () {
    state_change_to_account_menu();
  });

  // upload button
  $('#upload_container_button').on('click', function () {
    state_change_to_upload_menu();
  });

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
      set_dragger_locations(selected_file.image_id);
      // show dragger elements if an image is selected
      if (selected_file.image_id) {
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
      set_dragger_locations(selected_file.image_id);
      // show dragger if an image is selected
      if (selected_file.image_id) {
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
      socket.emit('clientemit_resetpage');
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
    state_change_to_upload();
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
        debug_report([[1, 'Error:' + xhr.status]]);
        // change navigation_container and remove upload_preview
        state_change_after_upload();
        uploadtotal = 0;
      },
      success: function (response) {
        // response variable from server is the uploaded file information
        var socketdata = {},
          images_element = document.getElementById('images'),
          image_element = document.createElement('img');

        // create new image
        image_element.setAttribute('id', response.dom_id);
        image_element.setAttribute('title', response.image_filename);
        image_element.classList.add('drawing');
        image_element.src = image_dir + response.image_filename;
        image_element.setAttribute('data-scale', '1');
        image_element.setAttribute('data-angle', '0');
        image_element.setAttribute('data-rotateX', '0');
        image_element.setAttribute('data-rotateY', '0');
        image_element.setAttribute('data-rotateZ', '0');
        image_element.setAttribute('data-persective', '0');
        image_element.style.width = upload_width;
        image_element.style.height = upload_height;
        image_element.style.zIndex = response.z_index;
        image_element.style.top = upload_top;
        image_element.style.left = upload_left;
        image_element.style.opacity = 1;
        image_element.style.WebkitFilter = 'grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)';
        image_element.style.transform = 'rotate(0deg) scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg)';

        // Add <div id='dom_id'> to <div id='images'>
        images_element.appendChild(image_element);
        // assign drag to added element
        assigndrag(response.dom_id);
        // change navigation container and remove upload_preview
        state_change_after_upload();
        // emit to other clients
        socketdata.uploaded_filename = response.image_filename;
        socket.emit('clientemit_share_upload', socketdata);

        uploadtotal = 0;
      }
    });
  });

  // reject upload
  $('#reject_upload_button').on('click', function () {
    state_change_after_upload();
  });


  $('#exit_door').on('click', function () {
    var delete_element = {};

    if ( (typeof selected_file.image_id !== 'undefined') && (selected_file.image_id.length > 0 ) ) {
      delete_element = document.getElementById(selected_file.image_id);

      // gather data
      image_to_delete.image_id = selected_file.image_id;
      image_to_delete.image_filename = delete_element.getAttribute('title');
      image_to_delete.src = delete_element.src;
      image_to_delete.width = delete_element.style.width;
      image_to_delete.height = delete_element.style.height;
      image_to_delete.zindex = delete_element.style.zIndex;

      // hide original image
      document.getElementById(image_to_delete.image_id).style.display = 'none';

      // hide draggers
      hide_draggers();

      // show delete_preview_container
      state_change_to_delete();

      // send socket to hide on other clients
      socket.emit('clientemit_hide_image', image_to_delete.image_id);
    };
  });

  // reject delete
  $('#reject_delete_button').on('click', function () {
    state_change_after_reject_delete();
    // send socket to show on other clients
    socket.emit('clientemit_show_image', image_to_delete.image_id);
  });

  // confirm delete
  $('#confirm_delete_button').on('click', function () {
    var socketdata = {};

    // remove image
    document.getElementById(image_to_delete.image_id).remove();
    // change navigation container
    state_change_after_delete();
    // prepare data to send
    socketdata.filename_to_delete = image_to_delete.image_filename;
    socketdata.id_to_delete = image_to_delete.image_id;
    // send data to server
    socket.emit('clientemit_delete_image', socketdata);
    clear_selected_file();
  });


  $('#instagram_login').on('click', function () {
    var redirect_url = [location.protocol, '//', location.host, location.pathname].join('');

    // redirect_url: http://www.example.com?myclient_id=johndoe
    redirect_url = redirect_url + '?myclient_id=' + client_id;

    // insta_step 24: If the client has an access token, open Instagram divs and skip to insta_step 7.

    // insta_access_ready is assigned during the initial socket 'connect_set_client_vars'
    if (insta_access_ready === true) {

      socket.emit('get_instagram_data');

      document.getElementById('insta_header').style.display = 'flex';
      document.getElementById('insta_div').style.display = 'block';
      document.getElementById('upload_container').classList.remove('upload_container_is_open');
      document.body.classList.add('button_container_is_open');

      // animate open hamburgers
      document.getElementById('line_one').style.top = '35%';
      document.getElementById('line_three').style.top = '65%';

    } else {

      // insta_step 1: Redirect to Instagram API to prompt user to authenticate
      // insta_app_id, provided to Instagram developers, is stored on the server
      // and fetched with the initial socket connection
      // Successful authentication will send the browser back to the server's
      // app.get('/') with 'myclient_id' and 'code' query parameter to be parsed by the server

      window.location = 'https://api.instagram.com/oauth/authorize/?client_id=' + insta_app_id + '&redirect_uri=' + redirect_url + '&response_type=code';
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
    socket.emit('client_emit_remove_client_from_clients_access', client_id);

    insta_access_ready = false;
  });





  $('#explore_button').on('click', function () {


    document.getElementById('explore_container').style.display = 'block';
    document.getElementById('close_explore_container').style.display = 'block';


    document.getElementById('explore_image').src = document.getElementById(selected_file.image_id).src;


    if (document.getElementById(selected_file.image_id).getAttribute('data-link').length > 1) {

      document.getElementById('insta_link').setAttribute('href', document.getElementById(selected_file.image_id).getAttribute('data-link'));
    };


    if ( (typeof selected_file.image_id !== 'undefined') && (selected_file.image_id.length > 0 ) ) {

      // if selected file is empty, fill it.




    } else {





    };

/*
      // gather data
      image_to_delete.image_id = selected_file.image_id;
      image_to_delete.image_filename = delete_element.getAttribute('title');
      image_to_delete.src = delete_element.src;
      image_to_delete.width = delete_element.style.width;
      image_to_delete.height = delete_element.style.height;
      image_to_delete.zindex = delete_element.style.zIndex;

      // hide original image
      document.getElementById(image_to_delete.image_id).style.display = 'none';

      // hide draggers
      hide_draggers();

      // show delete_preview_container
      state_change_to_delete();

      // send socket to hide on other clients
      socket.emit('clientemit_hide_image', image_to_delete.image_id);
*/


  });

  $('#close_explore_container').on('click', function () {
    document.getElementById('explore_container').style.display = 'none';
    document.getElementById('close_explore_container').style.display = 'none';
  });





// --Main drag function

  // use this function to assign draggable to all '.drawing' elements
  // and then specific elements by passing an id
  function assigndrag(id) {

    if (typeof id === 'undefined') {
      id = '.drawing';
    } else {
      id = '#' + id;
    };

    // draggable method from jquery.ui
    $(id).draggable(
      {
        // containment: 'window',
        stack: '.drawing', // the stack option automatically adjusts z-indexes for all .drawing elements
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

          clear_debug_box();
          debug_report([[1, 'Filename: ' + this.getAttribute('title')],
                 [2, 'Z-index: ' + this.style.zIndex],
                 [3, 'Start: Left: ' + this.style.left + ' Top: ' + this.style.top],
                 [4, 'Current: '],
                 [5, 'Stop: ']]);

          // store the original z index
          this.original_zindex = this.style.zIndex;

          // store image id
          this.image_id = this.getAttribute('id');

          // assign temporary z-index
          this.style.zIndex = 60000;

          hide_draggers();

          // remove filter
          // --this is necessary because dragging images with filter causes too much rendering lag
          this.setAttribute('data-filter', this.style.webkitFilter);
          this.style.webkitFilter = '';

          // send emit to remove filter from other clients
          socket.emit('clientemit_remove_filter', this.image_id);

          // pass id to clientemit_freeze
          socket.emit('clientemit_freeze', this.image_id);

          // begin to prepare socketdata
          this.socketdata = {};
          this.socketdata.image_id = this.image_id;
        },
        drag: function (event, ui) {
          // recoup drag position
          ui.position.left += this.recoupLeft;
          ui.position.top += this.recoupTop;

          // prepare socketdata to pass
          this.socketdata.image_top = this.style.top;
          this.socketdata.image_left = this.style.left;

          debug_report([[4, 'Current: Left: ' + this.socketdata.image_left + ' Top: ' + this.socketdata.image_top]]);

          // pass socket data to server
          socket.emit('clientemit_moving', this.socketdata);
        },
        stop: function () {
          // prepare data to send to ajax post, get all drawing elements
          var drag_post_data = {},
            i = 0,
            drawing_elements = document.body.getElementsByClassName('drawing');

          // return to the original z-index
          this.style.zIndex = this.original_zindex;

          // restore filter
          this.style.webkitFilter = this.getAttribute('data-filter');
          this.removeAttribute('data-filter');

          // send emit to restore filter to other clients
          socket.emit('clientemit_restore_filter', this.image_id);

          debug_report([[5, 'Stop: Left: ' + this.style.left + ' Top: ' + this.style.top]]);

          // send emit to unfreeze in other clients
          socket.emit('clientemit_unfreeze', this.image_id);

          // prepare data to send to server
          drag_post_data.dom_ids = [];
          drag_post_data.filenames = [];
          drag_post_data.z_indexes = [];
          drag_post_data.moved_file = this.getAttribute('title');
          drag_post_data.moved_posleft = this.style.left;
          drag_post_data.moved_postop = this.style.top;

          // populate drag_post_data
          for (i = 0; i < drawing_elements.length; i++) {
            drag_post_data.dom_ids[i] = drawing_elements[i].getAttribute('id');
            drag_post_data.filenames[i] = drawing_elements[i].getAttribute('title');
            drag_post_data.z_indexes[i] = drawing_elements[i].style.zIndex;
          };

          // ajax post from jquery.  FUTURE WORK: replace with a socket
          $.ajax({
            method: 'POST',
            url: '/dragstop',
            data: JSON.stringify( { drag_post_data: drag_post_data} ),
            contentType: 'application/json'
          }).done(function () {
          });

          // for set dragger locations
          selected_file.image_id = this.getAttribute('id');

          // reset click count
          click_count = 0;

//          set_dragger_locations(selected_file.image_id);
        }
      }).click( function () {
        var i = 0,
          image_objects = document.getElementsByClassName('drawing'),
          id_and_zindex = [],
          clicked_ids_zindexes = [],
          clickX = event.pageX,
          clickY = event.pageY,
          offset_left = 0,
          offset_top = 0,
          image_px_range = {},
          clicked_ids = '';

        // for each .drawing on the page...
        for (i = 0; i < image_objects.length; i ++) {

          // calculate the range of pixels it occupies on the page...
          offset_left = image_objects[i].getBoundingClientRect().left + document.body.scrollLeft;
          offset_top = image_objects[i].getBoundingClientRect().top + document.body.scrollTop;
          image_px_range = { x: [ offset_left, offset_left + image_objects[i].offsetWidth ],
                             y: [ offset_top, offset_top + image_objects[i].offsetHeight] };

          // if the click is within the image's range, add the .drawing id and z-index to an array.
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
        if ( (typeof selected_file.image_id !== 'undefined') && (selected_file.image_id.length > 0 ) ) {
          document.getElementById(selected_file.image_id).classList.remove('selected_file_animation');
          // css-trick: this will 'trigger a reflow' which will allow the class to be added again before the animation ends.
          document.getElementById(selected_file.image_id).offsetWidth;
        };

        // if one image is clicked...
        if (clicked_ids_zindexes.length === 1) {

          // set the selected_file
          selected_file.image_id = this.getAttribute('id');

          // add the selected_file_animation class
          document.getElementById(selected_file.image_id).classList.add('selected_file_animation');

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
          selected_file.image_id = clicked_ids_zindexes[(click_count - 1) % clicked_ids_zindexes.length][0];
          document.getElementById(selected_file.image_id).classList.add('selected_file_animation');

          // add temp_fade class to all clicked images other than the one selected
          for (i = 0; i < clicked_ids_zindexes.length; i++) {

            // don't add temp_fade class to selected_file, or to an image already faded, or if the selected_file is already on top
            if ((clicked_ids_zindexes[i][0] !== selected_file.image_id) && (document.getElementById(clicked_ids_zindexes[i][0]).style.opacity > 0.50)
               && ( (click_count % clicked_ids_zindexes.length) !== 1 )) {
              document.getElementById(clicked_ids_zindexes[i][0]).classList.add('temp_fade');
            };
          };

          // store clicked ids in a global string.  Note: Can't use an array as global variable.  Primitives are passed by value.  Objects are passed by 'copy of a reference'.
          previous_clicked_ids = clicked_ids;
        };

        set_dragger_locations(selected_file.image_id);

        clear_debug_box();
        debug_report([[1, 'Filename: ' + this.getAttribute('title')],
               [2, 'Z-index: ' + this.style.zIndex],
               [3, 'Start: Left: ' + this.style.left + ' Top: ' + this.style.top],
               [4, 'Current: '],
               [5, 'Stop: ']]);
      });
  };


// --Interact('.drawing').gesturable, for touchscreen rotating and scaling

  interact('.drawing').gesturable({
    onstart: function (event) {

      this.image_id = event.target.getAttribute('id');
      this.image_element = event.target;

      hide_draggers();

      // retrieve original angle and scale
      this.angle = parseFloat(this.image_element.getAttribute('data-angle'));
      this.scale = parseFloat(this.image_element.getAttribute('data-scale'));

      // pass id to clientemit_freeze
      socket.emit('clientemit_freeze', this.image_id);

      // prepare socketdata
      this.socketdata = {};
      this.socketdata.image_id = this.image_id;
      this.socketdata.image_filename = this.image_element.getAttribute('title');
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
      this.socketdata.image_transform = this.image_element.style.transform;
      socket.emit('clientemit_transforming', this.socketdata);
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

      socket.emit('clientemit_store_data_attributes', this.socketdata);
      this.socketdata.image_transform = this.image_element.style.transform;
      socket.emit('clientemit_store_transformed', this.socketdata);

      // pass id to clientemit_unfreeze
      socket.emit('clientemit_unfreeze', this.image_id);

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

  $('#exit_door').droppable({
    accept: '.drawing',
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
//       console.log('Draggable drawing dropped on exit door.');

      // gather data
      image_to_delete.image_id = ui.draggable.attr('id');
      image_to_delete.image_filename = ui.draggable.attr('title');
      image_to_delete.src = ui.draggable.attr('src');
      image_to_delete.width = ui.draggable.css('width');
      image_to_delete.height = ui.draggable.css('height');
      image_to_delete.zindex = ui.draggable.css('z-index');

      // hide original image
      document.getElementById(image_to_delete.image_id).style.display = 'none';

      // hide draggers
      hide_draggers();

      // show delete_preview_container
      state_change_to_delete();

      // send socket to hide on other clients
      socket.emit('clientemit_hide_image', image_to_delete.image_id);
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

      clear_debug_box();

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
      debug_report([[1, 'current left       : ' + this.style.left],
                    [2, 'left_when_on_right : ' + this.left_when_on_right_px],
                    [3, 'current top        : ' + this.style.top],
                    [4, 'top_when_on_bottom : ' + this.top_when_on_bottom_px],
                    [8, '. this.left_when_on_right_num - ui.position.left: ' + (this.left_when_on_right_num - ui.position.left) ]
                    ]);

      // take y axis measurements
      if (this.style.top === '0px') {
        debug_report([[5, 'Top or Bottom: Top']]);
        this.yplace = 'top';
        this.mostrecentyplace = 'top';
      } else if (this.style.top === this.top_when_on_bottom_px) {
        debug_report([[5, 'Top or Bottom: Bottom']]);
        this.yplace = 'bottom';
        this.mostrecentyplace = 'bottom';
      } else {
        debug_report([[5, 'Top or Bottom: Between']]);
        this.yplace = 'between';
      };

      // take x axis measurements
      if (this.style.left === '0px') {
        debug_report([[6, 'Left or Right: Left']]);
        this.xplace = 'left';
        this.mostrecentxplace = 'left';
      } else if (this.style.left === this.left_when_on_right_px) {
        debug_report([[6, 'Left or Right: Right']]);
        this.xplace = 'right';
        this.mostrecentxplace = 'right';
      } else {
        debug_report([[6, 'Left or Right: Between']]);
        this.xplace = 'between';
      };

      debug_report([[7, 'Corner: Not a corner.']]);

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
        debug_report([
        [7, 'Corner: ' + this.mostrecentxplace + ' ' + this.mostrecentyplace]]);
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
        navigation_toggle_button_is_stationary = true;
      }, 200);
    }
  });


// --Draggers

  $('#stretch_dragger').draggable({
    containment: 'parent',
    scroll: false,
    start: function () {
      // hide other draggers
      hide_other_draggers(this.getAttribute('id'));
      // prepare dom elements for manipulation
      this.image_id      = selected_file.image_id;
      this.image_element = document.getElementById(selected_file.image_id);
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
      socket.emit('clientemit_remove_filter', this.image_id);
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
      this.socketdata.image_transform = this.image_element.style.transform;
      this.socketdata.image_width     = this.image_element.style.width;
      this.socketdata.image_height    = this.image_element.style.height;
      this.socketdata.image_left      = this.image_element.style.left;
      this.socketdata.image_top       = this.image_element.style.top;
      socket.emit('clientemit_resizing', this.socketdata);
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
      socket.emit('clientemit_restore_filter', this.image_id);
      // save to database
      this.socketdata.image_filename  = this.image_element.getAttribute('title');
      // socket to other clients
      socket.emit('clientemit_store_resized', this.socketdata);
      // reset click count
      click_count = 0;
    }
  });

  $('#opacity_dragger').draggable({
    containment: 'parent',
    scroll: false,
    start: function () {
      // hide other draggers
      hide_other_draggers(this.getAttribute('id'));
      // prepare dom elements for manipulation
      this.image_id      = selected_file.image_id;
      this.image_element = document.getElementById(selected_file.image_id);
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
      this.socketdata.current_opacity = this.percentage_wide;
      socket.emit('clientemit_opacity_changing', this.socketdata);
    },
    stop: function () {
      // remove grid and dragger_info box
      remove_grid();
      // allow transitions
      this.classList.add('dragger_transitions');
      // show draggers
      set_dragger_locations(this.image_id);
      // save to database
      this.socketdata.image_filename  = this.image_element.getAttribute('title');
      socket.emit('clientemit_store_opacity', this.socketdata);
      // reset click count
      click_count = 0;
    }
  });

  $('#rotation_dragger').draggable({
    containment: 'parent',
    scroll: false,
    start: function () {
      // hide other draggers
      hide_other_draggers(this.getAttribute('id'));
      // prepare dom elements for manipulation
      this.image_id      = selected_file.image_id;
      this.image_element = document.getElementById(selected_file.image_id);
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
      // socket.emit('clientemit_remove_filter', this.image_id);
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
      this.socketdata.image_transform = this.image_element.style.transform;
      socket.emit('clientemit_transforming', this.socketdata);
    },
    stop: function () {
      // remove grid and dragger_info box
      remove_grid();
      // allow transitions
      this.classList.add('dragger_transitions');
      // restore filter
      // this.image_element.style.WebkitFilter = this.image_element.getAttribute('data-filter');
      // this.image_element.removeAttribute('data-filter');
      // socket.emit('clientemit_restore_filter', this.image_id);
      // save to database
      this.socketdata.image_filename  = this.image_element.getAttribute('title');
      // this.socketdata.image_transform = this.image_element.style.transform;
      socket.emit('clientemit_store_transformed', this.socketdata);
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
      socket.emit('clientemit_store_data_attributes', this.socketdata);
      // reset click count
      click_count = 0;
    }
  });

  $('#grayscale_invert_dragger').draggable({
    containment: 'parent',
    scroll: false,
    start: function () {
      // hide other draggers
      hide_other_draggers(this.getAttribute('id'));
      // prepare dom elements for manipulation
      this.image_id      = selected_file.image_id;
      this.image_element = document.getElementById(selected_file.image_id);
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
      this.socketdata.current_filter = this.image_element.style.WebkitFilter;
      socket.emit('clientemit_filter_changing', this.socketdata);
    },
    stop: function () {
      // remove grid and dragger_info box
      remove_grid();
      // allow transitions
      this.classList.add('dragger_transitions');
      // show draggers
      set_dragger_locations(this.image_id);
      // save to database
      this.socketdata.image_filename  = this.image_element.getAttribute('title');
      socket.emit('clientemit_store_filter', this.socketdata);
      // reset click count
      click_count = 0;
    }
  });

  $('#blur_brightness_dragger').draggable({
    containment: 'parent',
    scroll: false,
    start: function () {
      // hide other draggers
      hide_other_draggers(this.getAttribute('id'));
      // prepare dom elements for manipulation
      this.image_id      = selected_file.image_id;
      this.image_element = document.getElementById(selected_file.image_id);
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
      this.dragger_info.textContent = 'blur:' + ((1 - this.percentage_high) * blur_level).toFixed(2) + 'px brightness: ' + (this.percentage_wide * brightness_level).toFixed(2);
      // make the calculated changes
      this.image_element.style.WebkitFilter = this.image_element.style.WebkitFilter.replace(/blur\(.*?\)/      , 'blur(' + ((1 - this.percentage_high) * blur_level) + 'px)');
      this.image_element.style.WebkitFilter = this.image_element.style.WebkitFilter.replace(/brightness\(.*?\)/, 'brightness(' + (this.percentage_wide * brightness_level) + ')');
      // socket to other clients
      this.socketdata.current_filter = this.image_element.style.WebkitFilter;
      socket.emit('clientemit_filter_changing', this.socketdata);
    },
    stop: function () {
      // remove grid and dragger_info box
      remove_grid();
      // allow transitions
      this.classList.add('dragger_transitions');
      // show draggers
      set_dragger_locations(this.image_id);
      // save to database
      this.socketdata.image_filename  = this.image_element.getAttribute('title');
      socket.emit('clientemit_store_filter', this.socketdata);
      // reset click count
      click_count = 0;
    }
  });

  $('#contrast_saturate_dragger').draggable({
    containment: 'parent',
    scroll: false,
    start: function () {
      // hide other draggers
      hide_other_draggers(this.getAttribute('id'));
      // prepare dom elements for manipulation
      this.image_id      = selected_file.image_id;
      this.image_element = document.getElementById(selected_file.image_id);
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
      this.dragger_info.textContent = 'contrast:' + ((1 - this.percentage_high) * contrast_level).toFixed(2) +  ' saturate: ' + (this.percentage_wide * saturate_level).toFixed(2);
      // make the calculated changes
      this.image_element.style.WebkitFilter = this.image_element.style.WebkitFilter.replace(/contrast\(.*?\)/      , 'contrast(' + ((1 - this.percentage_high) * contrast_level) + ')');
      this.image_element.style.WebkitFilter = this.image_element.style.WebkitFilter.replace(/saturate\(.*?\)/, 'saturate(' + (this.percentage_wide * saturate_level) + ')');
      // socket to other clients
      this.socketdata.current_filter = this.image_element.style.WebkitFilter;
      socket.emit('clientemit_filter_changing', this.socketdata);
    },
    stop: function () {
      // remove grid and dragger_info box
      remove_grid();
      // allow transitions
      this.classList.add('dragger_transitions');
      // show draggers
      set_dragger_locations(this.image_id);
      // save to database
      this.socketdata.image_filename  = this.image_element.getAttribute('title');
      socket.emit('clientemit_store_filter', this.socketdata);
      // reset click count
      click_count = 0;
    }
  });

  $('#party_dragger').draggable({
    containment: 'parent',
    scroll: false,
    start: function () {
      // hide other draggers
      hide_other_draggers(this.getAttribute('id'));
      // prepare dom elements for manipulation
      this.image_id      = selected_file.image_id;
      this.image_element = document.getElementById(selected_file.image_id);
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
      this.socketdata.current_opacity = this.percentage_wide;
      this.socketdata.current_filter = this.image_element.style.WebkitFilter;
      socket.emit('clientemit_opacity_changing', this.socketdata);
      socket.emit('clientemit_filter_changing', this.socketdata);
    },
    stop: function () {
      // remove grid and dragger_info box
      remove_grid();
      // allow transitions
      this.classList.add('dragger_transitions');
      // show draggers
      set_dragger_locations(this.image_id);
      // save to database
      this.socketdata.image_filename  = this.image_element.getAttribute('title');
      this.socketdata.image_id = this.image_id;
      socket.emit('clientemit_store_opacity', this.socketdata);
      socket.emit('clientemit_store_filter', this.socketdata);
      // reset click count
      click_count = 0;
    }
  });

  $('#threeD_dragger').draggable({
    containment: 'parent',
    scroll: false,
    start: function () {
      // hide other draggers
      hide_other_draggers(this.getAttribute('id'));
      // prepare dom elements for manipulation
      this.image_id      = selected_file.image_id;
      this.image_element = document.getElementById(selected_file.image_id);

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
      this.socketdata.image_transform = this.image_element.style.transform;
      socket.emit('clientemit_transforming', this.socketdata);
    },
    stop: function () {
      // remove grid and dragger_info box
      remove_grid();
      // allow transitions
      this.classList.add('dragger_transitions');
      // save to database
      this.socketdata.image_filename  = this.image_element.getAttribute('title');
      this.socketdata.image_id = this.image_id;
      socket.emit('clientemit_store_transformed', this.socketdata);
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
      socket.emit('clientemit_store_data_attributes', this.socketdata);
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
      selected_image_width  = parseInt(image_element.style.width),
      selected_image_height = parseInt(image_element.style.height),
      // calculate the dragger location
      selected_image_width_percentage  = selected_image_width / mainwide,
      selected_image_height_percentage = selected_image_height / mainhigh,
      dragger_location_left            = selected_image_width_percentage * inner_width,
      dragger_location_top             = (1 - selected_image_height_percentage) * inner_height;

    // set the dragger location
    dragger_element.style.left    = dragger_location_left + 'px';
    dragger_element.style.top     = dragger_location_top + 'px';
    dragger_element.style.display = 'block';
    // allow transitions
    // setTimeout is needed because the dragger will otherwise transitioning from no selection to selection
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
      dragger_location_top = (parseFloat(blur_matches[1]) * inner_height / blur_level),
      dragger_location_left = (parseFloat(brightness_matches[1]) * inner_width / brightness_level);

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
      dragger_location_top = (parseFloat(contrast_matches[1]) * inner_height / contrast_level),
      dragger_location_left = (parseFloat(saturate_matches[1]) * inner_width / saturate_level);

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

}); // end of document.ready
