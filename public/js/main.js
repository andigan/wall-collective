// wall-collective
//
// Version: 0.6.0
// Requires: jQuery v1.7+
//           jquery-ui
//           jquery.form
//           jquery.mobile-events
//           jquery.ui.touch-punch
//           socket.io v1.3.7+
//           interact.js
//
// Copyright (c) 2016 Andrew Nease (andrew.nease.code@gmail.com)

$(document).ready( function () {

// --Development helpers

  // setTimeout(function () { $( '#debug_button' ).trigger( 'click' ); }, 0);
  // setTimeout(function () { $( '#navigation_toggle_button' ).trigger( 'click' ); }, 0);
  // setTimeout(function () { $( '#dragger_switches_button' ).trigger( 'click' ); }, 0);
  // setTimeout(function() { $('#wrapper').css('background-color', 'yellow'); },1500);


// --Setup and configure variables

  // set socket location : io.connect('http://localhost:8000'); || io.connect('http://www.domain_name.com');
  var socket = io.connect(window.location.href),

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

    // used by the upload counter
    uploadtotal = 0;

  // set wrapper size; (css vh and vw were not working with mobile safari)
  document.getElementById('wrapper').style.width = window.innerWidth + 'px';
  document.getElementById('wrapper').style.height = window.innerHeight + 'px';

  // add perspective to 3d transforms
  document.getElementById('images').style.width = window.innerWidth + 'px';
  document.getElementById('images').style.height = window.innerHeight + 'px';
  document.getElementById('images').style.webkitPerspective = '500px';
  document.getElementById('images').style.webkitPerspectiveOriginX = '50%';
  document.getElementById('images').style.webkitPerspectiveOriginY = '50%';

  // position the navigation_toggle_button_container on the bottom on startup.
  document.getElementById('navigation_toggle_button_container').style.top = (mainhigh - parseFloat(window.getComputedStyle(document.getElementById('navigation_toggle_button_container')).height) + 'px');

  // assign draggable to all .drawing elements
  assigndrag();


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
  document.ontouchmove = function (event) {
    event.preventDefault();
  };

  // process any click on the wrapper
  $('#wrapper').on('click touchstart', function (event) {
    var dragger_elements = {};
    // DEBUG: this line will log whichever element is clicked on
    // console.log(event.target.getAttribute('id'));

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
    // position the navigation_toggle_button_container on the bottom on startup.
    document.getElementById('navigation_toggle_button_container').style.top = (mainhigh - parseFloat(window.getComputedStyle(document.getElementById('navigation_toggle_button_container')).height) + 'px');
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


// --State Change functions
//     functions to change the state of the containers and buttons in response to drags, uploads, etc

  function state_change_to_close_all() {
    // hide elements
    document.getElementById('navigation_container').classList.remove('navigation_container_is_open');
    document.getElementById('upload_preview_container').classList.remove('upload_preview_container_is_open');
    document.getElementById('delete_preview_container').classList.remove('delete_preview_container_is_open');
    document.getElementById('dragger_switches_container').classList.remove('dragger_switches_container_is_open');
    document.getElementById('tools_container').classList.remove('tools_container_is_open');
    // replace image_upload_preview image and delete_preview image
    document.getElementById('image_upload_preview').src = '/icons/1x1.png';
    document.getElementById('delete_preview').src = '/icons/1x1.png';
  }

  function state_change_to_tools() {
    // show element
    document.getElementById('tools_container').classList.add('tools_container_is_open');
    // hide elements
    document.getElementById('navigation_container').classList.remove('navigation_container_is_open');
    document.getElementById('dragger_switches_container').classList.remove('dragger_switches_container_is_open');
  }

  function state_change_to_upload() {
    // hide element
    document.getElementById('navigation_container').classList.remove('navigation_container_is_open');
  }

  function state_change_after_upload() {
    // show element
    document.getElementById('navigation_container').classList.add('navigation_container_is_open');
    // hide elements
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

  // initial set up.  assign unique identifier to client.  used by upload counter
  // hack: Problem:  busboy stream begins receiving file stream before the client_id, which was passed as data value in the ajax submit
  //       Solution: change the HTML 'name' attribute of the form's input to the client_id
  socket.on('connect_assign_client_id', function (data) {
    client_id = data;
    document.getElementById('fileselect').setAttribute('name', client_id);
  });

  // initial set up.  assign image_directory from config file
  socket.on('connect_assign_image_dir', function (data) {
    image_dir = data;
  });

  // initial set up of dragger switches.  Universal persistent.
  socket.on('connect_assign_dragger_status', function (dragger_status) {
    if (dragger_status.stretch) { document.getElementById('stretch_dragger_switch').classList.add('switchon');};
    if (dragger_status.opacity) { document.getElementById('opacity_dragger_switch').classList.add('switchon');};
    if (dragger_status.rotation) { document.getElementById('rotation_dragger_switch').classList.add('switchon');};
    if (dragger_status.blur_brightness) { document.getElementById('blur_brightness_dragger_switch').classList.add('switchon');};
    if (dragger_status.grayscale_invert) { document.getElementById('grayscale_invert_dragger_switch').classList.add('switchon');};
    if (dragger_status.contrast_saturate) { document.getElementById('contrast_saturate_dragger_switch').classList.add('switchon');};
    if (dragger_status.threeD) { document.getElementById('threeD_dragger_switch').classList.add('switchon');};
    if (dragger_status.party) { document.getElementById('party_dragger_switch').classList.add('switchon');};
  });

  // on moving, move target
  socket.on('broadcast_moving', function (data) {
    document.getElementById(data.image_id).style.top  = data.image_top;
    document.getElementById(data.image_id).style.left = data.image_left;
  });

  // on resizing, resize target
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
    images_element.style.opacity = 1;
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
        document.body.classList.remove('button_container_is_open');
        // animate open hamburgers
        document.getElementById('line_one').style.top = '40%';
        document.getElementById('line_three').style.top = '60%';
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
        // animate close hamburgers
        document.getElementById('line_one').style.top = '35%';
        document.getElementById('line_three').style.top = '65%';
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
      document.getElementById('debug_button').textContent = 'info is off';
    // else when debug_box is closed, show it
    } else {
      debug_on = true;
      document.body.classList.add('debug_on');
      document.getElementById('debug_box').style.display = 'block';
      document.getElementById('debug_button').textContent = 'info is on';
    };
  });

  // tools button
  $('#tools_container_button').on('click', function () {
    state_change_to_tools();
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
    };
  });

  // set up dragger_switch functionalities
  $('.dragger_switch').click(function () {
    // this uses id='stretch_dragger_switch' to get 'stretch_dragger'
    var dragger_name = this.getAttribute('id').replace('_switch', '');

    // toggle dragger_switch
    this.classList.toggle('switchon');

    // if switched on
    if (this.classList.contains('switchon')) {
      // set dragger locations
      set_dragger_locations(selected_file.image_id);
      // show dragger if an image is selected
      if (selected_file.image_id) {
        document.getElementById(dragger_name).style.display = 'block';
      };
      // change persisitent status
      socket.emit('change_' + dragger_name + '_status', 'on');
    // else when switched off
    } else {
      // hide dragger
      document.getElementById(dragger_name).style.display = 'none';
      // change persistent status
      socket.emit('change_' + dragger_name + '_status', 'off');
    };
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
      window.location.reload(true);
    });
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

          // set dragger locations
          selected_file.src = this.src;
          selected_file.image_id = this.getAttribute('id');

          set_dragger_locations(selected_file.image_id);
        }
      }).click( function () {

        // set the dragger locations
        selected_file.src = this.src;
        selected_file.image_id = this.getAttribute('id');
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
      set_dragger_locations(this.image_id);
    }
  });


// --Exit door.droppable, for preparing a dropped image to delete

  $('#exit_door').droppable({
    accept: '.drawing',
    // activeClass: 'exit_active_class',
    hoverClass: 'exit_door_hover',
    tolerance: 'pointer',

    over: function () {
      // console.log('over exit door');
    },
    out: function () {
      // console.log('back out over exit door ');
    },
    drop: function (event, ui) {
      // console.log('Draggable drawing dropped on exit door.');

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
