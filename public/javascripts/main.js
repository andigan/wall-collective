// TO DO
// 1. z-index system: have more formal control over z-indexes on the page and with other clients
// 2. change posts to sockets (maybe)
// 3. Make sure deletes and uploads aren't ruined by simultaneous requests
// 4. #m5 is buried in the createswitchforid function
// 5. Figure out -stretch- mode and what is going on. //DONE
// 6. Implement module system
// 7. on stop drag, send all z_indexes to switch them in clients
// 8. if second image is dropped on toolbox, return the first to the page.
// 9. change resize dragger to lock_axis
// 10. performance seems severely dependent on image sizes on screen.
//     work to reduce image size to something more appropriate
// 11. Implement flat mode.  remove all angles, disallow rotations, and allow stretch mode
// 12. handle zero images on page
// 13. change .textContent to .innerText
// 14. fix upload dimensions

// QUESTION  nunjucks isn't reading the second string as a string
// without quotation marks
//        <script>
//        var resize_dragger_status = 'none';
//          var image_dir   = /art/;
//        </script>

// ---------------------------------------START--------------------------------------------------------------------

/*
* WhataDrag.js
*
* Version: 0.6.0
* Requires: jQuery v1.7+
*           jquery-ui
*           jquery.form
*           jquery.mobile-events
*           jquery.ui.touch-punch
*           socket.io v1.3.7+
*           interact.js
*
* Copyright (c) 2016 Andrew Nease (andrew.nease.code@gmail.com)
*
*
*
*   Variables recieved from index.html (via config from app.js):
*
*     image_dir = '/directory_name/'
*     draggername_dragger_status = 'block' or 'none'
*/

$(document).ready( function () {
/*
*   Development Helpers
*/

  // setTimeout(function () { $( '#toolbox_toggle_button' ).trigger( 'click' ); }, 0);
  // setTimeout(function () { $( '#draggers_toolbox_button' ).trigger( 'click' ); }, 0);
  // setTimeout(function () { $( '#report_button' ).trigger( 'click' ); }, 0);
  // setTimeout(function () { $( '#drag_stretch_button' ).trigger( 'click' ); }, 0);

  //
  // change color for debug
  // setTimeout(function(){$('.col_2').css('background-color', 'pink');}, 5000);
  // setTimeout(function() { $('#wrapper').css('background-color', 'blue'); },0);
  // setTimeout(function() { $('#wrapper').css('background-color', 'yellow'); },1500);
  //
  // alert an object
  // alert(JSON.stringify(object, null, 4));

/*
*   Setup functions/configs
*     calculate and set variables
*/

  // set socket location
  // -- typical values: io.connect('http://localhost:8000');
  //                    io.connect('http://www.domain_name.com');
  var socket = io.connect(window.location.href),

    // set dragger sizes
    dragger_width = 40,
    dragger_height = 40,

    // calculate app size variables; used throughout page
    mainwide     = $(window).width(),
    mainhigh     = $(window).height(),
    mainwidepx   = mainwide.toString().concat('px'),
    mainhighpx   = mainhigh.toString().concat('px'),
    inner_width  = mainwide - dragger_width,
    inner_height = mainhigh - dragger_height,

    // set upload placement
    upload_top = '0px',
    upload_left = '0px',
    upload_width = '75px',

    // set visual limits for draggers
    blur_level = 7,
    brightness_level = 8,
    contrast_level = 10,
    saturate_level = 10,

    // set up selected_file, which is used when an image is clicked or dragged
    selected_file = { },

    // used by the upload counter (TO BE REPLACED)
    uploadtotal = 0,

    // previously used by toolbox_button.draggable
    // toolbox_button_is_stationary = true,

    // used by report box
    report_on = true;

  // FUTURE WORK: this is to define report_on if it is undeclared/undefined
  if (typeof(report_on) === 'undefined') {
    report_on = false;
  };

  // calculate wrapper size
  document.getElementById('wrapper').style.width = mainwidepx;
  document.getElementById('wrapper').style.height = mainhighpx;
  document.getElementById('wrapper').style.backgroundColor = 'black';

  // call setup functions
  create_reportbox(); // create report box, make it draggable
  toolbox_setup();  // select where to put buttons
  adjust_toolbox(); // for when window is resized, adjusts the sizes within the toolbox using mainwide and mainhigh
  assigndrag();     // initial assign drag to all .drawing elements
  draggers_setup();  // setup dragger buttons


/*
*   Setup functions/configs
*     toolbox set up
*     configure where to put menu buttons
*/

  function toolbox_setup() {
    var selectlocation_element = document.getElementById('mc2r0'),
      previewlocation_element = document.getElementById('mc2r2'),
      selectbox_element = document.createElement('div'),
      selectheader_element = document.createElement('div'),
      selectcontainer_element = document.createElement('div'),
      selectimage_element = document.createElement('img'),
      previewcontainer_element = document.createElement('div'),
      previewimage_element = document.createElement('img');

    // create buttons for toolboxes
    createbuttonforid ('delete_file_button'               , 'mc1r1', 'Delete Image'); // hidden
    createbuttonforid ('draggers_toolbox_button'          , 'mc1r1', 'Draggers');

    createbuttonforid ('confirm_upload_button'            , 'mc2r1', 'Confirm Upload'); // hidden
    createbuttonforid ('settings_toolbox_button'          , 'mc3r1', 'Settings');

    createbuttonforid ('drag_stretch_button'              , 'sc1r1', '-Drag-');
    createbuttonforid ('report_button'                    , 'sc1r2', 'Info Is Off');
    createbuttonforid ('reset_page_button'                , 'sc2r3', 'Reset Page');

    // create switches for draggers
    createswitchforid ('dragger_all_switch'               , 'dc1r1', 'all draggers');
    createswitchforid ('resize_dragger_switch'            , 'dc1r2', 'resize');
    createswitchforid ('rotation_dragger_switch'          , 'dc1r3', 'rotation');

    createswitchforid ('opacity_dragger_switch'           , 'dc3r1', 'opacity');

    createswitchforid ('blur_brightness_dragger_switch'   , 'dc2r1', 'blur/brightness');
    createswitchforid ('grayscale_invert_dragger_switch'  , 'dc2r2', 'grayscale/invert');
    createswitchforid ('contrast_saturate_dragger_switch' , 'dc2r3', 'contrast/saturate');

    createswitchforid ('party_dragger_switch'             , 'dc3r3', 'party');


    // FUTURE WORK: explore javascript version of adding a form
    // add_file_button form
    $('#mc1r2').append("\
      <form id='add_file_button' name='title' method='post'\
            enctype='multipart/form-data'\
            action='addfile/' runat='server'>\
        <div class='btn-file button'> Upload Image\
        <input id='fileselect' type='file' name='upl'>\
        </div>\
      </form>");

    // create div structure for image_preview_container
    previewcontainer_element.setAttribute('id', 'image_upload_preview_container');
    previewlocation_element.appendChild(previewcontainer_element);

    previewimage_element.setAttribute('id', 'image_upload_preview');
    previewimage_element.src = '/images/1x1.png';
    previewimage_element.alt = 'confirm upload';
    previewcontainer_element.appendChild(previewimage_element);
    // Result:
    //  <div id='image_upload_preview_container'>
    //    <img id='image_upload_preview'
    //         src='/images/1x1.png' alt='confirm upload'>
    //  </div>

    // create div structure for selected_image_box
    selectbox_element.setAttribute('id', 'selected_image_box');
    selectlocation_element.appendChild(selectbox_element);

    selectheader_element.setAttribute('id', 'selectheader');
    selectcontainer_element.setAttribute('id', 'selected_image_container');
    selectbox_element.appendChild(selectheader_element);
    selectbox_element.appendChild(selectcontainer_element);

    selectimage_element.setAttribute('id', 'selected_image');
    selectimage_element.src = '/images/1x1.png';
    selectimage_element.alt = 'selected image';
    selectcontainer_element.appendChild(selectimage_element);
    //    result:
    //    <div id='selected_image_box'>
    //      <div id='selectheader'>
    //      </div>
    //      <div id='selected_image_container'>
    //        <img id='selected_image'
    //             src='/images/1x1.png' alt='selected image'>
    //      </div>
    //    </div>
  } // end of toolbox_setup

/*
*   Setup functions/configs
*     draggers set up
*     configure dragger colors and names
*/

  function draggers_setup() {
    //           | dragger_name(for js) | background_color | box_shadow_color | name
    dragger_setup('resize'              , 'lightblue'      , 'blue'           , 'resize'  );
    dragger_setup('opacity'             , 'white'          , 'white'          , 'opacity' );
    dragger_setup('rotation'            , 'lightgreen'     , 'green'          , 'rotate'  );
    dragger_setup('blur_brightness'     , 'orange'         , 'yellow'         , 'blur'    );
    dragger_setup('grayscale_invert'    , 'gray'           , 'gray'           , 'gray'    );
    dragger_setup('contrast_saturate'   , 'pink'           , 'red'            , 'cont');
    dragger_setup('party'               , 'violet'         , 'purple'         , 'party'   );

    // maintain persistent universal dragger statuses
    if (resize_dragger_status            === 'block') { document.getElementById('resize_dragger_switch').classList.add('switchon');};
    if (opacity_dragger_status           === 'block') { document.getElementById('opacity_dragger_switch').classList.add('switchon');};
    if (rotation_dragger_status          === 'block') { document.getElementById('rotation_dragger_switch').classList.add('switchon');};
    if (blur_brightness_dragger_status   === 'block') { document.getElementById('blur_brightness_dragger_switch').classList.add('switchon');};
    if (grayscale_invert_dragger_status  === 'block') { document.getElementById('grayscale_invert_dragger_switch').classList.add('switchon');};
    if (contrast_saturate_dragger_status === 'block') { document.getElementById('contrast_saturate_dragger_switch').classList.add('switchon');};
    if (party_dragger_status             === 'block') { document.getElementById('party_dragger_switch').classList.add('switchon');};

    // set up all_dragger button functionality
    // *!* javascript version:
    $('#dragger_all_switch').click(function () {
      var switch_elements = {},
        dragger_elements = {},
        i = 0;

      // toggle all_dragger switch
      this.classList.toggle('switchon');
      // if all_dragger has been switched on, add class 'switchon' to all class 'switchbtn's and show draggers
      if (document.getElementById('dragger_all_switch').classList.contains('switchon')) {
        switch_elements = document.getElementsByClassName('switchbtn');
        for (i = 0; i < switch_elements.length; i++) {
          switch_elements[i].classList.add('switchon');
        };
        dragger_elements = document.getElementsByClassName('dragger');
        for (i = 0; i < dragger_elements.length; i++) {
          dragger_elements[i].style.display = 'block';
        };
      // if all_dragger has been switched off, remove class 'switchon' from all class 'switchbtn's and hide draggers
      } else {
        switch_elements = document.getElementsByClassName('switchbtn');
        for (i = 0; i < switch_elements.length; i++) {
          switch_elements[i].classList.remove('switchon');
        };
        dragger_elements = document.getElementsByClassName('dragger');
        for (i = 0; i < dragger_elements.length; i++) {
          dragger_elements[i].style.display = 'none';
        };
      };
    }); // end of dragger_all_switch.click

    // *!* Jquery version:
    /*
    $('#dragger_all_switch').click(function () {
      $(this).toggleClass('switchon');
      if ($(this).hasClass('switchon')) {
        $('.switchbtn').addClass('switchon');
      } else {
        $('.switchbtn').removeClass('switchon');
        $('.dragger').css('display', 'none');
      }; // end of if
    }); // end of dragger_all_switch.click
    */
  };// end of dragger_setup

/*
*   Setup helper functions
*     create button for location id
*     A function to create specific buttons to div ids
*/

  function createbuttonforid(buttonname, id, button_label) {
    var button_element = document.createElement('div'),
      id_element = document.getElementById(id);

    // setup button_element div
    button_element.setAttribute('id', buttonname);
    button_element.classList.add('button');
    button_element.textContent = button_label;

    // Add new element to 'id'
    id_element.appendChild(button_element);

    // special case: hide delete and confirm upload buttons
    if ((buttonname === 'delete_file_button') || (buttonname === 'confirm_upload_button')) {
      button_element.style.display = 'none';
    };

    // special case: add drag-is-open class to drag_stretch toggle
    if (buttonname === 'drag_stretch_button') {
      button_element.classList.add('drag-is-open');
    };
  }

  /*
  *   Setup helper functions
  *     create switch for location id
  *     A function to create specific switches to div ids
  */

  function createswitchforid(switchname, id, switch_label) {
    var id_element = document.getElementById(id),
      switch_element = document.createElement('div'),
      switchlabel_element = document.createElement('div');

    switchlabel_element.classList.add('switchlabel');
    switchlabel_element.textContent = switch_label;

    switch_element.setAttribute('id', switchname);
    switch_element.classList.add('switchbtn');

    // Add new element to 'id'
    id_element.appendChild(switchlabel_element);
    id_element.appendChild(switch_element);

    // special case: underline dragger_all_switch label
    if (switchname === 'dragger_all_switch') {
      switchlabel_element.style.textDecoration = 'underline';
    };
  } // end of createswitchforid

/*
*   Setup helper functions
*     report box functions and draggable
*/

  function create_reportbox() {
    info_element = {},
    i = 0,
    wrapper_element = document.getElementById('wrapper'),

    // create a new div id='reportbox'
    report_box_element = document.createElement('div');

    report_box_element.setAttribute('id', 'reportbox');
    report_box_element.style.display = 'none';

    // create 10 new sub divs id='info#' and attach to 'reportbox'
    for (i = 1; i <= 10; i++) {
      info_element = document.createElement('div');
      info_element.setAttribute('id', 'info' + i);
      info_element.classList.add('info');
      report_box_element.appendChild(info_element);
    };

    // Add 'reportbox' to 'wrapper'
    wrapper_element.appendChild(report_box_element);

    // make reportbox draggable
    $('#reportbox').draggable({
      containment: 'parent',
      drag: function () {
        var report_box_element = document.getElementById ('reportbox'),
        // tempcos is a DOMRect object with six properties: left, top, right, bottom, width, height
          report_box_coords = report_box_element.getBoundingClientRect();

        report([[7, 'screen.width      :' + screen.width.toString()],
                [9, 'screen.availWidth :' + screen.availWidth.toString()],
                [8, 'window.innerWidth :' + window.innerWidth.toString()],
                [6, 'wrapper width     :' + $('#wrapper').css('width')],
                [2, '--100px'],
                [5, 'this div width: ' + $(this).css('width')],
                [3, $(this).css('left') + ' <css> ' + $(this).css('right')],
                [4, report_box_coords.left.toString() + ' <dom> ' + report_box_coords.right.toString()]]);

        if (report_on === true) {
          document.getElementById('info1').style.display = 'block';
          document.getElementById('info1').style.height = '5px';
          document.getElementById('info1').style.width = '100px';
          document.getElementById('info1').style.backgroundColor = 'white';
        };
      } // end of drag
    }); // end of reportbox draggable
  } // end of create_reportbox()

  // requires multidimensional array with number from 1-10 and strings [[1, string], [2, string]];
  function report(report_strings) {
    var i = 0;

    if (report_on === true) {
      for (i = 0; i < report_strings.length; i++) {
        document.getElementById('info' + report_strings[i][0]).textContent = report_strings[i][1];
      };
    };
  }

  function clearreport() {
    var i = 0,
      info_elements = {};

    if (report_on === true) {
      info_elements = document.getElementsByClassName('info');
      for (i = 0; i < info_elements.length; i++) {
        info_elements[i].textContent = '';
        // remove measuring stick
        info_elements[i].style.height = 'auto';
        info_elements[i].style.width = 'auto';
        info_elements[i].style.backgroundColor = 'inherit';
      };
    };
  }
  // * optional initial report box
  report([[4, 'screen.width      :' + screen.width.toString()],
          [6, 'screen.availWidth :' + screen.availWidth.toString()],
          [5, 'window.innerWidth :' + window.innerWidth.toString()],
          [3, 'wrapper width     :' + $('#wrapper').css('width')],
          [2, '--100px']]);
  if (report_on === true) {
    document.getElementById('info1').style.display = 'block';
    document.getElementById('info1').style.height = '5px';
    document.getElementById('info1').style.width = '100px';
    document.getElementById('info1').style.backgroundColor = 'white';
  };

/*
*   adjust_toolbox
*     called when toolbox_container size initializes or changes.
*     adjust the sizes within the toolbox using mainwide and mainhigh
*     mainwide and mainhigh are newly assigned, based on window.height, window.width
*     FUTURE WORK: Eventually implement flex boxes and vh, vw
*                  and remove this section altogether
*/

  function adjust_toolbox() {

    // toolbox_container new width and height
    var tbwidth = mainwide,
      tbheight = mainhigh * 0.4,

      columnwid = tbwidth * 0.3333333,
      rowhigh = tbheight * 0.33333333;

    // This is used to size columns, rows, and buttons
    $('.col_1').css({ 'top': '0',
                      'left': '0',
                      'height': tbheight + 'px',
                      'width': columnwid + 'px'});
    $('.col_2').css({ 'top': '0',
                      'left': columnwid + 'px',
                      'height': tbheight + 'px',
                      'width': columnwid + 'px'});
    $('.col_3').css({ 'top': '0',
                      'left': (columnwid * 2) + 'px',
                      'height': tbheight + 'px',
                      'width': columnwid + 'px'});
    $('.row_1').css({ 'top': '0',
                   // 'left': '0px',
                      'width': columnwid + 'px',
                      'height': rowhigh + 'px'});
    $('.row_2').css({ 'top': rowhigh + 'px',
                   // 'left': columnwid + 'px',
                      'width': columnwid + 'px',
                      'height': rowhigh + 'px'});
    $('.row_3').css({ 'top': (rowhigh * 2) + 'px',
                   // 'left': (columnwid * 2) + 'px',
                      'width': columnwid + 'px',
                      'height': rowhigh + 'px'});

    $('.col_2 .row_2').css('height', (rowhigh * 2) + 'px');

    $('.button').css({'left': (columnwid * 0.1) + 'px',
                      'top': (rowhigh * 0.1) + 'px',
                      'height': (rowhigh * 0.8) + 'px',
                      'width': (columnwid * 0.8) + 'px',
                      'line-height': (rowhigh * 0.8) + 'px'});


    document.getElementById('toolbox_toggle_container').style.top = 'auto';
    document.getElementById('toolbox_toggle_container').style.left = 'auto';
    document.getElementById('toolbox_toggle_container').style.bottom = '0';
    document.getElementById('toolbox_toggle_container').style.right = '0';
  } // end of adjust_toolbox


/*
*   dragger_setup
*     draggers_setup to create draggers and add dragger_switch functionalities
*/

  function dragger_setup(dragger_name, background_color, box_shadow_color, name) {
    var wrapper_element = document.getElementById('wrapper'),
      dragger_element = document.createElement('div');

    dragger_element.setAttribute('id', dragger_name + '_dragger');
    dragger_element.classList.add('dragger', 'dragger_transitions');
    dragger_element.style.height = dragger_height + 'px';
    dragger_element.style.width = dragger_width + 'px';
    dragger_element.style.boxShadow = '0 0 3px 3px ' + box_shadow_color;
    dragger_element.style.lineHeight = dragger_height + 'px';
    dragger_element.textContent = name;

    // Add 'dragger_element' to 'wrapper'
    wrapper_element.appendChild(dragger_element);

    // FUTURE WORK: experimental mix-blend-mode
    // $('#' + dragger_name + '_dragger').css('mix-blend-mode', 'difference');

    // set up dragger_switch functionalities
    $('#' + dragger_name + '_dragger_switch').click(function () {

      // toggle dragger_switch
      this.classList.toggle('switchon');

      // if switched on, show dragger, change persistent status
      if (this.classList.contains('switchon')) {
        document.getElementById(dragger_name + '_dragger').style.display = 'block';
        socket.emit('change_' + dragger_name + '_dragger_status', 'block');
      // else hide dragger, change persistent status
      } else {
        document.getElementById(dragger_name + '_dragger').style.display = 'none';
        socket.emit('change_' + dragger_name + '_dragger_status', 'none');
      };
    }); // end of dragger_switch.clicks
  }; // end of dragger_setup

/*
*   toolbox change functions
*     Functions to change the state of the toolbox
*     in response to drags, uploads, etc
*/

  function toolbox_change_to_default() {
    // show
    document.getElementById('add_file_button').style.display = 'block';
    document.getElementById('drag_stretch_button').style.display = 'block';
    document.getElementById('settings_toolbox_button').style.display = 'block';
    document.getElementById('draggers_toolbox_button').style.display = 'block';
    // hide
    document.getElementById('delete_file_button').style.display = 'none';
    document.getElementById('confirm_upload_button').style.display = 'none';
    document.getElementById('selected_image_box').style.display = 'none';
    // change
    document.getElementById('image_upload_preview').src = '/images/1x1.png';
    document.getElementById('selected_image').src = '/images/1x1.png';

    document.getElementById('toolbox-container').classList.remove('file_selection_ready', 'upload_ready');
  } // end of toolbox_change_to_default

  function toolbox_change_to_file_selected() {
    // show
    document.getElementById('delete_file_button').style.display = 'block';
    document.getElementById('selected_image_box').style.display = 'block';
    // hide
    document.getElementById('add_file_button').style.display = 'none';
    document.getElementById('drag_stretch_button').style.display = 'none';
    document.getElementById('draggers_toolbox_button').style.display = 'none';
    document.getElementById('settings_toolbox_button').style.display = 'none';
    document.getElementById('confirm_upload_button').style.display = 'none';

    document.getElementById('toolbox-container').classList.add('file_selection_ready');
  } // end of toolbox_change_to_file_selected


  function toolbox_change_to_upload() {
    // show
    document.getElementById('confirm_upload_button').style.display = 'block';
    // hide
    document.getElementById('settings_toolbox_button').style.display = 'none';
    document.getElementById('drag_stretch_button').style.display = 'none';
    document.getElementById('draggers_toolbox_button').style.display = 'none';
    document.getElementById('delete_file_button').style.display = 'none';

    document.getElementById('toolbox-container').classList.add('upload_ready');
  } // end of toolbox_change_to_upload


/*
*   Page helper functions
*/

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


/*
*   Page helper functions
*     prevent default behavior
*     to prevent iphone dragging and bouncing
*     http://www.quirksmode.org/mobile/default.html
*/
  document.ontouchmove = function (event) {
    event.preventDefault();
  };

/*
*   Page helper functions
*     on wrapper click
*/
  $('#wrapper').on('click touchstart', function (event) {
    var dragger_elements = {};

    // if wrapper is clicked...
    // this is necessary because the wrapper is registered under other clicks
    if (event.target.getAttribute('id') === 'wrapper') {
      dragger_elements = document.getElementsByClassName('dragger');

      // remove all draggers
      for (i = 0; i < dragger_elements.length; i++) {
        dragger_elements[i].style.display = 'none';
      };

      // close toolboxes, disable dragger transitions
      document.body.classList.remove('dragger_transitions',
                                     'a-toolbox-is-open',
                                     'toolbox-is-open',
                                     'toolbox2-is-open',
                                     'toolbox3-is-open');
    };
  }); // end of document.on.click


/*
*   Page helper functions
*     handle when window is resized or rotated
*/

  // Listen for resize changes and make changes to the page
  window.addEventListener('resize', function () {
    mainwide = $(window).width();
    mainhigh = $(window).height();
    mainwidepx = mainwide.toString().concat('px');
    mainhighpx = mainhigh.toString().concat('px');
    inner_width  = mainwide - dragger_width;
    inner_height = mainhigh - dragger_height;

    // set wrapper size
    document.getElementById('wrapper').style.width = mainwidepx;
    document.getElementById('wrapper').style.height = mainhighpx;

    //* optional report box
    clearreport();
    report([[1, 'resize: new width : ' + mainwidepx],
            [2, 'resize: new height : ' + mainhighpx]]);
    adjust_toolbox();
  // bubbling phase (ahem)
  }, false); // end of addEventListener.resize




/*
*   Page helper functions
*     grid lines
*     use left/top with px unit
*     id is optional
*/

  function vline(left, color, id) {
    var wrapper_element = document.getElementById('wrapper'),
      line_element = document.createElement('div');

    if (id) {
      line_element.setAttribute('id', id);
      line_element.classList.add('vline');
      line_element.style.backgroundColor = color;
      line_element.style.left = left;
    } else {
      line_element.classList.add('vline');
      line_element.style.backgroundColor = color;
      line_element.style.left = left;
    };

    // Add 'line_element' to 'wrapper'
    wrapper_element.appendChild(line_element);
  } // end of vline

  function hline(top, color, id) {
    var wrapper_element = document.getElementById('wrapper'),
      line_element = document.createElement('div');

    if (id) {
      line_element.setAttribute('id', id);
      line_element.classList.add('hline');
      line_element.style.backgroundColor = color;
      line_element.style.top = top;
    } else {
      line_element.classList.add('hline');
      line_element.style.backgroundColor = color;
      line_element.style.top = top;
    };

    // Add 'line_element' to 'wrapper'
    wrapper_element.appendChild(line_element);
  } // end of hline

/*
*   Page helper functions
*     create a grid.  used during draggers dragging.
*/

  function make_grid() {
    var wrapper_element = document.getElementById('wrapper'),
      info_element = document.createElement('div');

    info_element.setAttribute('id', 'dragger_info');
    info_element.style.left = ((dragger_width / 2) + 1) + 'px';
    info_element.style.height = (dragger_height / 2) + 'px';
    info_element.style.width = (mainwide - dragger_width - 2) + 'px';

    // Add 'info_element' to 'wrapper'
    wrapper_element.appendChild(info_element);

    // show some grid lines
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


/*
*   Socket.io
*     Initialized above:
*     var socket = io.connect(window.location.href);
*
*     These are functions to receive an emit from the server,
*     recognize its name, receive its data, and do something with the data.
*
*     // when 'broadcast_name' event is received, do something with the data
*     socket.on('broadcast_name', function(data) {
*       use data
*     });
*
*   FUTURE WORK:
*     Not currently using: this one fires when a connection is made:
*    socket.on('connect', function(data) {
*      $('#' + id).append(
*        "<div id='resize_dragger_switch' class='button'> Dragger Off </div>");
*    });
*/

/*
*   Socket.io
*     image changes
*     Listen for changes and modify target
*/

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

  // on resize stop, resize target
  socket.on('broadcast_resized', function (data) {
    document.getElementById(data.image_id).style.transform = data.image_transform;
    document.getElementById(data.image_id).style.top       = data.image_top;
    document.getElementById(data.image_id).style.left      = data.image_left;
    document.getElementById(data.image_id).style.width     = data.image_width;
    document.getElementById(data.image_id).style.height    = data.image_height;
  });

  // on scaled, scale target
  socket.on('broadcast_scaled_angled', function (data) {
    document.getElementById(data.image_id).setAttribute('data-scale', data.scale);
    document.getElementById(data.image_id).setAttribute('data-angle', data.angle);
  });

  // on transforming, transform target
  socket.on('broadcast_transforming', function (data) {
    document.getElementById(data.image_id).style.transform = data.image_transform;
  });

  // on opacity changing, adjust target
  socket.on('broadcast_opacity_changing', function (data) {
    document.getElementById(data.image_id).style.opacity = data.current_opacity;
  });

  // on filter changing, adjust target
  socket.on('broadcast_filter_changing', function (data) {
    document.getElementById(data.image_id).style.WebkitFilter = data.current_filter;
  });

/*
*   Socket.io
*     page changes
*     Listen for reset page, and reload the page
*/

  socket.on('broadcast_resetpage', function () {
    window.location.reload(true);
  });

/*
*   Socket.io
*     upload and delete
*     Handle uploads and deletions
*/

  // remove deleted image
  socket.on('broadcast_delete_image', function (data) {
    document.getElementById(data.selected_id).remove();
  });

  // add uploaded image
  socket.on('broadcast_add_upload', function (data) {
    var images_element = document.getElementById('images'),
      image_element = document.createElement('img');

    image_element.setAttribute('id', data.domtag);
    image_element.setAttribute('title', data.image_filename);
    image_element.classList.add('drawing', 'resize-drag');
    image_element.src = image_dir + data.image_filename;
    image_element.setAttribute('data-scale', '1');
    image_element.setAttribute('data-angle', '0');
    image_element.style.width = upload_width;
    image_element.style.zIndex = data.z_index;
    image_element.style.top = upload_top;
    image_element.style.left = upload_left;
    image_element.style.WebkitFilter = 'grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)';
    image_element.style.transform = 'rotate(0deg) scale(1)';

    // Add 'dragger_element' to 'wrapper'
    images_element.appendChild(image_element);
    // assign drag to added element
    assigndrag(data.domtag);
  });

/*
*   Socket.io
*     additional helpers
*/

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

  // disable dragging
  socket.on('broadcast_freeze', function (data) {
    $('#' + data).draggable ( 'disable' );
  });
  // enable dragging
  socket.on('broadcast_unfreeze', function (data) {
  // this if prevents enabling drag when -resize- mode is active
    if (document.getElementById('drag_stretch_button').classList.contains('drag-is-open')) {
      $('#' + data).draggable ( 'enable' );
    };
  });

  // hide elements
  socket.on('broadcast_hide_image', function (data) {
    document.getElementById(data).style.display = 'none';
  });
  // show elements
  socket.on('broadcast_show_image', function (data) {
    document.getElementById(data.image_id).style.display = 'block';
    document.getElementById(data.image_id).style.left = data.selected_left + 'px';
    document.getElementById(data.image_id).style.top = data.selected_top + 'px';
  });

/*
*   Socket.io
*     FUTURE WORK: temporary upload info socket event:
*     this needs to be assigned to specific filenames
*     and it needs to reset to 0 properly
*     and it would help to know the total file size of course
*     and it would be nice to have a progress bar
*/

  socket.on('broadcast_chunk_sent', function (uploaddata) {
    uploadtotal = uploadtotal + uploaddata;
    report([[1, 'Uploaded ' + uploaddata + ' bytes for a total of ' + uploadtotal  + ' bytes' ]]);
  });

/*
*   Buttons
*     IMPORTANT: Delegated vs. Direct binding
*     Example:  $('#id').on('click', function() { console.log('hi')};
*     This is a direct binding, which means new elements added to the DOM won't work.
*     Instead, use a delegated binding:
*     Example:  $( document ).on('click', '.upload', function(){
*     IMPORTANT: I've changed my mind.
*     Delegated binding seems to cost more resources in the number of compares to process.
*     Go with direct binding.
*/

/*
*   Buttons
*     move/resize
*/

  // on click, toggle move/resize
  $('#drag_stretch_button').on('click', function () {
    var button_element = document.getElementById('drag_stretch_button');

    // if '-drag-' is on, replace it with '-resize-'
    if (button_element.classList.contains('drag-is-open')) {
      // switch to "resize" mode
      button_element.textContent = '-Stretch-';
      button_element.classList.remove('drag-is-open');
      button_element.classList.add('stretch-is-open');
      // disable moving
      $('.drawing').draggable( 'disable' );
      // enable resizing
      interact('.resize-drag').resizable ( { enabled: true } );
    // else if '-resize-' is on, replace it with '-drag-'
    } else {
      // switch to "-drag-" mode
      button_element.textContent = '-Drag-';
      button_element.classList.remove('stretch-is-open');
      button_element.classList.add('drag-is-open');
      // enable moving
      $('.drawing').draggable( 'enable' );
      // disable resizing
      interact('.resize-drag').resizable ( { enabled: false } );
    }; // end of if
  }); // end of drag/stretch button

/*
*   Buttons
*     open/close toolbox
*/

  // on click, toggle toolbox, change toolbox to default
  $('#toolbox_toggle_button').on( 'click', function () {
    var button_element = document.getElementById('toolbox_toggle_button');

    // if the button is being dragged, don't do anything with the click
    // FUTURE WORK: stop event propagation
    if ( button_element.classList.contains('dragging_no_click') === false ) {

      // if any toolbox is open, close it
      if (  document.body.classList.contains('a-toolbox-is-open')  ) {

        document.body.classList.remove('a-toolbox-is-open',
                                       'toolbox-is-open',
                                       'toolbox2-is-open',
                                       'toolbox3-is-open');

        // animate hamburgers
        document.getElementById('line_one').style.top = '40%';
        document.getElementById('line_three').style.top = '60%';


        // show selected_file in case it was removed by being dragged onto the toolbox
        if (typeof selected_file.image_id !== 'undefined') {
          document.getElementById(selected_file.image_id).style.display = 'block';
        };

        // reset toolbox
        toolbox_change_to_default();
      // if no toolboxes are open, open them all
      } else {

        document.body.classList.add('a-toolbox-is-open',
                                    'toolbox-is-open',
                                    'toolbox2-is-open',
                                    'toolbox3-is-open');

        /* FUTURE WORK: maybe can delete
        *   not sure why, but the above line wasn't working some of the time after the page loaded
        *   so I added the classes below
        *   setTimeout(function () {
        *   document.body.classList.add('a-toolbox-is-open',
        *                               'toolbox-is-open',
        *                               'toolbox2-is-open',
        *                               'toolbox3-is-open');
        *   }, 10);
        */

        // animate hamburgers
        document.getElementById('line_one').style.top = '35%';
        document.getElementById('line_three').style.top = '65%';



      }; // end of a-toolbox-is-open if
    }; // end of dragging_no_click if
  });   // end of toolbox_toggle_button click


/*
*   Buttons
*     reportbox button
*/

  // on click, toggle reportbox
  $('#report_button').on('click', function () {
    // if report_box is open, hide it
    if (  document.body.classList.contains('report_on') ) {
      report_on = false;
      document.body.classList.remove('report_on');
      document.getElementById('reportbox').style.display = 'none';
      document.getElementById('report_button').textContent = 'Info Is Off';
    // if toolbox is closed, show it
    } else {
      report_on = true;
      document.body.classList.add('report_on');
      document.getElementById('reportbox').style.display = 'block';
      document.getElementById('report_button').textContent = 'Info Is On';
    }; // end of if
  }); // end of #report_button.on(click)

/*
*   Buttons
*     toolbox2 / settings button
*/

  // on click, close toolbox and toolbox3 to show toolbox2
  $('#settings_toolbox_button').on('click', function () {
    document.body.classList.add('a-toolbox-is-open');
    document.body.classList.remove('toolbox-is-open', 'toolbox3-is-open');
  }); // end of on click

/*
*   Buttons
*     toolbox3 / draggers button
*/

  // on click, close toolbox and toolbox2 to show toolbox3
  $('#draggers_toolbox_button').on('click', function () {
    document.body.classList.add('a-toolbox-is-open');
    document.body.classList.remove('toolbox-is-open', 'toolbox2-is-open');
  }); // end of on click

/*
*   Buttons
*     reset page
*     jquery $.get to reset the page, and socket to other clients
*
*     $.get contains data and status parameters
*     $.get('/resetpage', function (data, status) {
*     alert('Data: ' + data + '\nStatus: ' + status);
*/

  $('#reset_page_button').on('click', function () {
    $.get('/resetpage', function () {
      socket.emit('clientemit_resetpage');
      // reload the page
      window.location.reload(true);
    }); // end of get
  }); // end of resetpage on.click


/*
*   Buttons
*     upload and confirm upload
*/

  // this function provides the image for the image preview.
  // http://stackoverflow.com/questions/18934738/select-and-display-images-using-filereader
  // https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
  function readURL(input) {
    var reader;

    if (input.files && input.files[0]) {
      reader = new FileReader();
      reader.onload = function (event) {
        document.getElementById('image_upload_preview').src = event.target.result;
      }; // end of reader.onload function set
      reader.readAsDataURL(input.files[0]);
    } // end of if
  } // end of readURL


  // on click, load up the image preview
  $('#fileselect').on('change', function () {
    // change toolbox to add confirm_upload_button
    toolbox_change_to_upload();
    // use the helper function above to load preview image into the toolbox
    // readURL(document.getElementById('fileselect'));
    readURL(this);
  }); // end of file select change


  // on click, send a submit to the html form with id='add_file_button'
  // the html form with id='add_file_button' posts to '/addfile'
  $('#confirm_upload_button').on('click', function () {
    $('#add_file_button').ajaxSubmit({
      // method from jquery.form
      error: function (xhr) {
        status('Error: ' + xhr.status);
        // change toolbox and remove upload_preview
        toolbox_change_to_default();
      },
      success: function (response) {
  /* response from server is the uploaded file information:
  *  response.image_filename
  *  response.idtag
  *  response.domtag
  *  response.z_index	*/
        var socketdata = {},
          images_element = document.getElementById('images'),
          image_element = document.createElement('img');

        console.log('Image added to database.');
        // create new image
        image_element.setAttribute('id', response.domtag);
        image_element.setAttribute('title', response.image_filename);
        image_element.classList.add('drawing', 'resize-drag');
        image_element.src = image_dir + response.image_filename;
        image_element.setAttribute('data-scale', '1');
        image_element.setAttribute('data-angle', '0');
        image_element.style.width = upload_width;
        image_element.style.zIndex = response.z_index;
        image_element.style.top = upload_top;
        image_element.style.left = upload_left;
        image_element.style.WebkitFilter = 'grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)';
        image_element.style.transform = 'rotate(0deg) scale(1)';

        // Add 'dragger_element' to 'wrapper'
        images_element.appendChild(image_element);
        // assign drag to added element
        assigndrag(response.domtag);

        // change toolbox and remove upload_preview
        toolbox_change_to_default();

        // replace image_upload_preview
        document.getElementById('image_upload_preview').src = '/images/1x1.png';

        // emit to other clients
        socketdata.uploaded_filename = response.image_filename;
        socket.emit('clientemit_share_upload', socketdata);

        // FUTURE WORK: this is helping the upload counter socket
        uploadtotal = 0;
      } // end of ajax submit success
    }); // end of ajax submit
  }); // end of confirmbutton on.click

/*
*   Buttons
*     delete button
*     requires selected_file object to be populated
*/

  $('#delete_file_button').on('click', function () {
    var socketdata = {};

    // remove hidden image
    document.getElementById(selected_file.image_id).remove();
    // change toolbox to default
    toolbox_change_to_default();
    // remove select_image preview
    document.getElementById('selected_image').src = '/images/1x1.png';
    // prepare data to send
    socketdata.selected_filename = selected_file.image_filename;
    socketdata.selected_id = selected_file.image_id;
    // send data to server
    socket.emit('clientemit_delete_image', socketdata);
    clear_selected_file();
  }); // end of delete.on.click


  /*
  *   Buttons
  *     straighten button
  *
  */





  function horizontalmode() {


//    interact('.drawing').gesturable ( { enabled: false } );




  };

  horizontalmode();





/*
*   main interactive methods
*     1. main event drag, for images
*     2. interact('.drawing').gesturable, for touchscreen rotating and scaling
*     3. -resize- mode, for stretching the x and y axes
*     4. Toolbox.droppable, for preparing a dropped selected_file for handling (delete)
*     5. toolbox_toggle_button.draggable, for dragging the toolbox_toggle_button around the edges
*/

/*
*   main interactive methods
*     1. main event drag, for images
*     uses Ajax, touchpunch, jquery-ui: $('.drawing').draggable( {start: drag: stop} )
*                                                    .click()
*     mobile-events:                                 .doubletap
*     stop callback: contains the AJAX POST to /dragdrop
*/

  // Use this function to assign drag function to all elements | assigndrag();
  // and then specific elements by passing an id               | assigndrag(id);
  function assigndrag(id) {

    if (typeof id === 'undefined') {
      id = '.drawing';
    } else {
      id = '#' + id;
    };

    // draggable method from jquery.ui
    $(id).draggable(
      {
        // snap: true, // FUTURE WORK: turn this on and off in toolbox; look up snap options
        // refreshPositions: true, // maybe try this and see effect
        // containment: 'window',
        stack: '.drawing', // the stack option automatically adjusts z-indexes for all .drawing elements
        scroll: true,
        start:  function (event, ui) {
          // recoup for transformed objects
          // this works well to keep the drag event centered on a transformed object.
          // http://stackoverflow.com/questions/3523747/webkit-and-jquery-draggable-jumping
          // uses a ternary operator:
          //   boolean statement ? true result : false result;
          //   if boolean statement is true, do first, else do second.
          //   so if left is not a number, make it zero, otherwise make it left
          var left = parseInt( this.style.left , 10),
            top = parseInt( this.style.top , 10);

          left = isNaN(left) ? 0 : left;
          top = isNaN(top) ? 0 : top;
          this.recoupLeft = left - ui.position.left;
          this.recoupTop = top - ui.position.top;

          //* optional report box
          clearreport();
          report([[1, 'Filename: ' + this.getAttribute('title')],
                 [2, 'Z-index: ' + this.style.zIndex],
                 [3, 'Start: Left: ' + this.style.left + ' Top: ' + this.style.top],
                 [5, 'Stop: ']]);

          // store the original z index
          // alternate: this.original_zindex = event.target.style.zIndex;
          this.original_zindex = this.style.zIndex;

          // store image id
          this.image_id = this.getAttribute('id');

          // assign temporary z-index
          this.style.zIndex = 60000;

          // put filter in a data attribute
          // --this was necessary because dragging images with filter caused too much rendering lag
          this.setAttribute('data-filter', this.style.webkitFilter);
          this.style.webkitFilter = '';

          // send emit to remove filter from other clients
          socket.emit('clientemit_remove_filter', this.image_id);

          // pass id to clientemit_freeze
          socket.emit('clientemit_freeze', this.image_id);

          // begin to prepare socketdata
          this.socketdata = {};
          this.socketdata.image_id = this.image_id;
        }, // end of start
        drag: function (event, ui) {
          // recoup drag position
          ui.position.left += this.recoupLeft;
          ui.position.top += this.recoupTop;

          // prepare socketdata to pass
          this.socketdata.image_top = this.style.top;
          this.socketdata.image_left = this.style.left;

          //* optional report box
          report([[3, 'Current: Left: ' + this.socketdata.image_left + ' Top: ' + this.socketdata.image_top]]);

          // pass socket data to server
          socket.emit('clientemit_moving', this.socketdata);
        }, // end of drag
        stop: function () {
          // prepare data to send to ajax post, get all drawing elements
          var data_for_database = {},
            i = 0,
            drawing_elements = document.body.getElementsByClassName('drawing');

          // return to the original z-index
          this.style.zIndex = this.original_zindex;

          // restore filter
          this.style.webkitFilter = this.getAttribute('data-filter');
          this.removeAttribute('data-filter');

          // send emit to restore filter to other clients
          socket.emit('clientemit_restore_filter', this.image_id);

          //* optional report box
          report([[4, 'Stop: Left: ' + this.style.left + ' Top: ' + this.style.top]]);

          // send emit to unfreeze in other clients
          socket.emit('clientemit_unfreeze', this.image_id);

          // prepare data for ajax post
          // FUTURE WORK: replace with socket

          data_for_database.domtags = [];
          data_for_database.filenames = [];
          data_for_database.z_indexes = [];
          data_for_database.moved_file = this.getAttribute('title');
          data_for_database.moved_posleft = this.style.left;
          data_for_database.moved_postop = this.style.top;

          // populate data_for_database
          for (i = 0; i < drawing_elements.length; i++) {
            data_for_database.domtags[i] = drawing_elements[i].getAttribute('id');
            data_for_database.filenames[i] = drawing_elements[i].getAttribute('title');
            data_for_database.z_indexes[i] = drawing_elements[i].style.zIndex;
          };

          console.log('---- data_for_database ----');
          console.log(data_for_database);

          // ajax post from jquery
          $.ajax({
            method: 'POST',
            url: '/dragstop',
            data: JSON.stringify( { data_for_database: data_for_database} ),
            contentType: 'application/json'
          }).done(function () {
            console.log('successful ajax post');
          }); // end of ajax post to /dragdrop

          // set dragger locations
          selected_file.src = this.src;
          selected_file.image_id = this.getAttribute('id');

          if (document.getElementById('toolbox-container').classList.contains('file_selection_ready') === false) {
            set_dragger_locations(selected_file.image_id);
          };
        } // end of stop function  // end of draggable is below
      // end of draggable
      }).click( function () {

        // set the dragger locations
        selected_file.src = this.src;
        selected_file.image_id = this.getAttribute('id');
        set_dragger_locations(selected_file.image_id);

/*
        //* optional report box
        clearreport();
        report([[1, 'Filename: ' + this.getAttribute('title')],
               [2, 'Z-index: ' + this.style.zIndex],
               [3, 'Start: Left: ' + this.style.left + ' Top: ' + this.style.top],
               [4, 'Current: '],
               [5, 'Stop: ']]);
*/
      // end of click
      }).doubletap( function () {
      // fullscreen function.  doubletap methods from mobile-events
        var fullscreenmask_element = document.createElement('div');

        fullscreenmask_element.setAttribute('id', 'fullscreenmask');
        fullscreenmask_element.classList.add('fullscreenmaskclass');
        fullscreenmask_element.style.backgroundImage = 'url(' + image_dir + this.getAttribute('title') + ')';

        // add fullscreenmask_element to body
        document.body.appendChild(fullscreenmask_element);

        // remove fullscreenmask_element if fullscreen is doubletapped
        $('#fullscreenmask').doubletap(function () {
          fullscreenmask_element.remove();
        }); // end of second doubletap
      // end of first doubletap
      }); // end of drawing.draggable.click.doubletap
  }; // end of assign drag



/*
*   main interactive methods
*     2. interact('.drawing').gesturable, for touchscreen rotating and scaling
*/

  interact('.drawing').gesturable({
    onstart: function (event) {
//      var rotate_Exp;

      this.image_id = event.target.getAttribute('id');
      this.image_element = event.target;

      // get the current rotate value
      // rotate_Exp = /rotate\(([^)]+)\)/,
      // rotate_matches = rotate_Exp.exec(this.image_element.style.transform);
      // this.angle = parseInt(rotate_matches[1]);

      this.angle = parseFloat(this.image_element.getAttribute('data-angle'));
      this.scale = parseFloat(this.image_element.getAttribute('data-scale'));

      // pass id to clientemit_freeze
      socket.emit('clientemit_freeze', this.image_id);

      // prepare socketdata
      this.socketdata = {};
      this.socketdata.image_id = this.image_id;
      this.socketdata.image_filename = this.image_element.getAttribute('title');

      // clearreport();
    },
    onmove: function (event) {
      // retrieve scale and angle from event object
      this.scale = this.scale * (1 + event.ds);
      this.angle += event.da;

      // report([[1, this.angle]]);

      // modify element with new transform
      this.image_element.style.transform = 'rotate(' + this.angle + 'deg) scale(' + this.scale + ')';

      // send socketdata
      this.socketdata.image_transform = this.image_element.style.transform;
      socket.emit('clientemit_transforming', this.socketdata);
    },
    onend: function (event) {
      // report([[2, 'final angle: ' + this.angle]]);
      // if angle is < 0 or > 360, revise the angle to 0-360 range
      if (this.angle < 0) {
        this.angle = (360 + this.angle);
        this.image_element.style.transform = 'rotate(' + this.angle + 'deg) scale(' + this.scale + ')';
      };
      if (this.angle > 360) {
        this.angle = (this.angle - 360);
        this.image_element.style.transform = 'rotate(' + this.angle + 'deg) scale(' + this.scale + ')';
      };
      // report([[3, 'revised angle: ' + this.angle]]);

      // send socketdata
      this.socketdata.scale = this.scale.toFixed(2);
      this.socketdata.angle = this.angle.toFixed(2);
      socket.emit('clientemit_store_scale_angle', this.socketdata);
      this.socketdata.image_transform = this.image_element.style.transform;
      socket.emit('clientemit_store_transformed', this.socketdata);

      // pass id to clientemit_unfreeze
      socket.emit('clientemit_unfreeze', this.image_id);

      // put scale and angle into data-scale and data-angle
      event.target.setAttribute('data-scale', this.scale.toFixed(2));
      event.target.setAttribute('data-angle', this.angle.toFixed(2));


      // reset draggers
      set_dragger_locations(this.image_id);
    }
  }); // end of interact.gesturable


/*
*   main interactive methods
*     3. -resize- mode, for stretching the x and y axes
*
*/

  interact('.resize-drag').resizable({
    enabled: false,
    preserveAspectRatio: false,
    edges: { left: true, right: true, bottom: true, top: true },
    invert: 'reposition',
    onstart: function (event) {

      this.image_id = event.target.getAttribute('id');
      this.image_element = event.target;

      // gather data
      this.angle = this.image_element.getAttribute('data-angle');
      this.scale = this.image_element.getAttribute('data-scale');

      //* optional report box
      // clearreport();
      // report([[1, 'Drag Id: ' + this.image_id]]);
      // report([[2, 'scale: ' + this.scale]]);
      // report([[3, 'angle: ' + this.angle]]);

      // prepare to socket
      this.socketdata = {};
      this.socketdata.image_filename = event.target.getAttribute('title');
      this.socketdata.image_id = this.image_id;
    },
    onmove: function (event) {
      var target = event.target,
      // use the data-x and data-y defined below or zero // resets to zero after stop
        x = (parseFloat(target.getAttribute('data-x')) || 0),
        y = (parseFloat(target.getAttribute('data-y')) || 0);

      // add translate when resizing from top or left edges
      x += event.deltaRect.left;
      y += event.deltaRect.top;

      // update the element's style
      target.style.width  = event.rect.width + 'px';
      target.style.height = event.rect.height + 'px';
      target.style.transform = 'rotate(' + this.angle + 'deg) scale(' + this.scale + ') translate(' + x + 'px,' + y + 'px)';

      // store tranlate values in data attributes
      target.setAttribute('data-x', x);
      target.setAttribute('data-y', y);

      // emit to other clients
      this.socketdata.image_transform = target.style.transform;
      this.socketdata.image_width = target.style.width;
      this.socketdata.image_height = target.style.height;
      this.socketdata.image_left = target.style.left;
      this.socketdata.image_top = target.style.top;
      socket.emit('clientemit_resizing', this.socketdata);
    },
    onend: function (event) {
      // get the starting left and top positions
      var csslft_num = parseInt(this.image_element.style.left),
        csstop_num = parseInt(this.image_element.style.top);

      // add the translate value to the left/top to get new left/top
      this.image_element.style.left = (csslft_num + parseInt(this.image_element.getAttribute('data-x'))) + 'px';
      this.image_element.style.top = (csstop_num + parseInt(this.image_element.getAttribute('data-y'))) + 'px';

      // remove translate transform, return to normal transform
      this.image_element.style.transform = 'rotate(' + this.angle + 'deg) scale(' + this.scale + ')';

      // save to database and emit new values to other clients
      this.socketdata.image_transform = event.target.style.transform;
      this.socketdata.image_width = event.target.style.width;
      this.socketdata.image_height = event.target.style.height;
      this.socketdata.image_left = event.target.style.left;
      this.socketdata.image_top = event.target.style.top;
      socket.emit('clientemit_store_resized', this.socketdata);

      set_dragger_locations(this.image_id);

      // report([[9, 'final transform: ' + event.target.style.transform]]);

      // remove these attributes.  they will be redefined above as needed.
      this.image_element.removeAttribute('data-x');
      this.image_element.removeAttribute('data-y');
    } // end of onend
  });









/*
*   main interactive methods
*     4. Toolbox.droppable, for preparing a dropped selected_file for handling (delete)
*/

  // jquery-ui method
  $('#toolbox-container').droppable({
    accept: '.drawing',
    // activeClass: 'tool_active_class',
    // hoverClass: 'tool_hover_class',
    tolerance: 'intersect',

    over: function () {
      // console.log('over toolbox-container');
      toolbox_change_to_file_selected();
    },
    out: function () {
      // console.log('back out over toolbox-container ');
      toolbox_change_to_default();
    },
    drop: function (event, ui) {
      // console.log('Draggable drawing dropped on toolbox.');
      var dragger_elements = {},
        i = 0;

      // gather data
      selected_file.image_id = ui.draggable.attr('id');
      selected_file.image_filename = ui.draggable.attr('title');
      selected_file.src = ui.draggable.attr('src');
      selected_file.width = ui.draggable.css('width');
      selected_file.height = ui.draggable.css('height');
      selected_file.zindex = ui.draggable.css('z-index');

      // hide original image
      document.getElementById(selected_file.image_id).style.display = 'none';

      // hide draggers
      dragger_elements = document.getElementsByClassName('dragger');
      for (i = 0; i < dragger_elements.length; i++) {
        dragger_elements[i].style.display = 'none';
      };

      // send socket to hide on other clients
      socket.emit('clientemit_hide_image', selected_file.image_id);

      // show and hide buttons
      toolbox_change_to_file_selected();

      //  put the selected image in the selected_image box
      document.getElementById('selected_image').src = selected_file.src;

      //* optional report box
      clearreport();
      report([[1, 'selected file: ' + selected_file.src]]);

      // make image preview draggable
      //    This is NOT a direct copy of ''/dragdrop'
      //    start:  return to original size and z-index
      //    stop:   get the left and top from window;
      //            round the numbers, convert to strings
      //            bring the original image id back with css data
      $('#selected_image').draggable( {
        scroll: true,
        // snap: true, // FUTURE WORK: turn this on and off in toolbox; look up snap options
        // refreshPositions: true, // maybe try this and see effect
        // containment: 'window',
        start:  function (event, ui) {
          // console.log('Dragged back off');

          // recoup for transformed objects
          var left = parseInt( this.style.left , 10),
            top = parseInt( this.style.top , 10);

          left = isNaN(left) ? 0 : left;
          top = isNaN(top) ? 0 : top;
          this.recoupLeft = left - ui.position.left;
          this.recoupTop = top - ui.position.top;

          // restore image dimensions
          this.style.maxHeight = 'none';
          this.style.width = selected_file.width;
          this.style.height = selected_file.height;
          this.style.zIndex = selected_file.zindex;

          //* optional report box
          clearreport();
          report([[1, 'Filename: ' + this.getAttribute('title')],
                 [2, 'Z-index: ' + this.style.zIndex],
                 [3, 'Start: Left: ' + this.style.left + ' Top: ' + this.style.top],
                 [5, 'Stop: ']]);
        }, // end of start
        drag: function (event, ui) {
          // recoup drag position
          ui.position.left += this.recoupLeft;
          ui.position.top += this.recoupTop;

          //* optional report box
          report([[4, 'Current: Left: ' + this.style.left + ' Top: ' + this.style.top]]);

        }, // end of drag
        stop: function () {
          // console.log('stopped');
          var data = {},
            data_for_database = {},
            i = 0,
            selectcontainer_element = document.getElementById('selected_image_container'),
            selectimage_element = document.getElementById('selected_image'),
            newselectimage_element = document.createElement('img'),
            drawing_elements = document.body.getElementsByClassName('drawing'),
            selected_top = Math.round(this.getBoundingClientRect().top).toString(),
            selected_left = Math.round(this.getBoundingClientRect().left).toString();

          // reshow and reposition original image
          document.getElementById(selected_file.image_id).style.display = 'block';
          document.getElementById(selected_file.image_id).style.left = selected_left + 'px';
          document.getElementById(selected_file.image_id).style.top = selected_top + 'px';

          // show image on other clients
          data.image_id = selected_file.image_id;
          data.selected_left = selected_left;
          data.selected_top = selected_top;

          socket.emit('clientemit_show_image', data);

          // change toolbox.  this will replace the selected image
          toolbox_change_to_default();

          // remove and replace selected_image
          selectimage_element.remove();

          newselectimage_element.setAttribute('id', 'selected_image');
          newselectimage_element.src = '/images/1x1.png';
          newselectimage_element.alt = 'selected image';
          selectcontainer_element.appendChild(newselectimage_element);

          //* optional report box
          clearreport();
          report([[2, 'Z-index: ' + document.getElementById(selected_file.image_id).style.zIndex],
                 [5, 'Stop: Left: ' + document.getElementById(selected_file.image_id).style.left + ' Top: ' + document.getElementById(selected_file.image_id).style.top]]);

          // partial copy from dragstop main event
          data_for_database.domtags = [];
          data_for_database.filenames = [];
          data_for_database.z_indexes = [];
          data_for_database.moved_file = document.getElementById(selected_file.image_id).getAttribute('title');
          data_for_database.moved_posleft = document.getElementById(selected_file.image_id).style.left;
          data_for_database.moved_postop = document.getElementById(selected_file.image_id).style.top;

          // populate data_for_database
          for (i = 0; i < drawing_elements.length; i++) {
            data_for_database.domtags[i] = drawing_elements[i].getAttribute('id');
            data_for_database.filenames[i] = drawing_elements[i].getAttribute('title');
            data_for_database.z_indexes[i] = drawing_elements[i].style.zIndex;
          };

          console.log('---- data_for_database ----');
          console.log(data_for_database);

  // ajax post
          $.ajax({
            method: 'POST',
            url: '/dragstop',
            data: JSON.stringify( { data_for_database: data_for_database} ),
            contentType: 'application/json'
          }).done(function () {
            console.log('successful ajax post after moving selected file.');
          }); // end of ajax post to /dragdrop

          // set dragger locations
          set_dragger_locations(selected_file.image_id);
        } // end of stop function
      });
    } // end of drop
  }); // end of toolbox droppable



/*
*   main interactive methods
*     5. toolbox_toggle_button.draggable, for dragging the toolbox_toggle_button around the edges
*/

  $('#toolbox_toggle_container').draggable({
    cancel: true,
    containment: 'parent',
    scroll: false,
    start: function (event, ui) {

      // used to prevent click from registering
      document.getElementById('toolbox_toggle_button').classList.add('dragging_no_click');

      clearreport();

      // store the starting position of the toolbox_toggle_container
      this.starting_position = ui.position;

      // get the starting size
      this.high = $(this).height();
      this.wide = $(this).width();

      // initialize values used within draggable
      this.commit_switch = 0;
      this.commit_axis = 'neither';
      this.previous_drag_position = ui.position;

      // get values of top and left for bottom and right placements
      this.top_when_on_bottom_num = (mainhigh - this.high);
      this.left_when_on_right_num = (mainwide - this.wide);
      this.top_when_on_bottom_px = this.top_when_on_bottom_num.toString().concat('px');
      this.left_when_on_right_px = this.left_when_on_right_num.toString().concat('px');

      // this is for eventual usage, maybe.
      // Compares the middle of the element with the middle of the window to assess starting position
      if ((ui.position.top + (this.high / 2)) > (mainhigh / 2)) {
        // report([[1, 'started from bottom']]);
        this.b_or_t = 'b';
      } else {
        // report([[1, 'started from top']]);
        this.b_or_t = 't';
      };
      if ((ui.position.left + (this.wide / 2)) > (mainwide / 2)) {
        // report([[2, 'started from right']]);
        this.l_or_r = 'r';
      } else {
        // report([[2, 'started from left']]);
        this.l_or_r = 'l';
      };
    }, // end of start
    drag: function (event, ui) {
      // ui.position.top is wherever the drag cursor goes, not the element
      // ui.position.left = Math.min( 10, ui.position.left ); // the example given to keep the element 10 pixels from left

      report([[3, 'current left       : ' + this.style.left],
              [4, 'left_when_on_right : '  + this.left_when_on_right_px],
              [5, 'current top        : ' + this.style.top],
              [6, 'top_when_on_bottom : ' + this.top_when_on_bottom_px] ]);

      // take measurement of where the element is
      if (this.style.top === '0px') {
        report([[7, 'Edge: Top']]);
        this.yplace = 'top';
        this.mostrecentyplace = 'top';
      } else if (this.style.top === this.top_when_on_bottom_px) {
        report([[7, 'Edge: Bottom']]);
        this.yplace = 'bottom';
        this.mostrecentyplace = 'bottom';
      } else {
        report([[7, 'Edge: Left or Right']]);
        this.yplace = 'between';
      };

      if (this.style.left === '0px') {
        report([[8, 'Edge: Left']]);
        this.xplace = 'left';
        this.mostrecentxplace = 'left';
      } else if (this.style.left === this.left_when_on_right_px) {
        report([[8, 'Edge: Right']]);
        this.xplace = 'right';
        this.mostrecentxplace = 'right';
      } else {
        report([[8, 'Edge: Top or Bottom']]);
        this.xplace = 'between';
      };

      report([[9, 'Corner: NO!']]);

      // if it's on an edge, keep it there
      if ((this.yplace == 'top') && (this.xplace == 'between') ) {
        ui.position.top = 0;
        this.commit_axis = 'neither';
      } else if ((this.yplace == 'bottom') && (this.xplace == 'between') ) {
        ui.position.top = this.top_when_on_bottom_num;
        this.commit_axis = 'neither';
      } else if ((this.xplace == 'left') && (this.yplace == 'between') ) {
        ui.position.left = 0;
        this.commit_axis = 'neither';
      } else if ((this.xplace == 'right') && (this.yplace == 'between') ) {
        ui.position.left = this.left_when_on_right_num;
        this.commit_axis = 'neither';
      // if it's on a corner...
      } else {
        report([[8, 'Edge: '],
                [9, 'Corner: YES!']]);

        // first, measure the directions and distances
        // this.xdirection = (this.previous_drag_position.left > ui.position.left) ? 'left' : 'right';
        // this.ydirection = (this.previous_drag_position.top > ui.position.top) ? 'up' : 'down';
        this.xdistance = (this.starting_position.left - ui.position.left);
        this.ydistance = (this.starting_position.top - ui.position.top);

        if ( (this.commit_axis == 'x') && (this.mostrecentyplace == 'top') ) {
          report([[10, 'Committed to: top']]);
          ui.position.top = 0;
        };
        if ( (this.commit_axis == 'x') && (this.mostrecentyplace == 'bottom') ) {
          report([[10, 'Committed to: bottom']]);
          ui.position.top = this.top_when_on_bottom_num;
        };
        if ( (this.commit_axis == 'y') && (this.mostrecentxplace == 'left') ) {
          report([[10, 'Committed to: left']]);
          ui.position.left = 0;
        };
        if ( (this.commit_axis == 'y') && (this.mostrecentxplace == 'right') ) {
          report([[10, 'Committed to: right']]);
          ui.position.left = this.left_when_on_right_num;
        };
        if (this.commit_axis == 'neither') {
          // turn on the commit switch and commit to an axis
          if ( (this.xdistance >  5) || (this.ydistance >  5)
            || (this.xdistance < -5) || (this.ydistance < -5)   ) {
            // use absolute numbers since some drags will result in negative distances
            this.xdistance = Math.abs(this.xdistance);
            this.ydistance = Math.abs(this.ydistance);
            // choose the commit axis based on the greater movement
            if (this.xdistance >= this.ydistance) {
              this.commit_axis = 'x';
            } else {
              this.commit_axis = 'y';
            }; // end of if
          }; // end of if
        }; // end of extra if
      }; // end of restricting movement if

      // prepare for next iteration of corner drag
      this.previous_drag_position = ui.position;

/* FUTURE WORK
      // this was used by taphold to prevent taphold functionality when dragging
      if (toolbox_button_is_stationary) {

        this.x_distance = (this.starting_position.left - ui.position.left);
        this.y_distance = (this.starting_position.top - ui.position.top);

        if (   (this.x_distance >  5) || (this.y_distance >  5)
            || (this.x_distance < -5) || (this.y_distance < -5)   ) {

          toolbox_button_is_stationary = false;
        };
      };
*/

    }, // end of drag
    stop: function () {

      // this causes the class to be removed before the next click event begins
      setTimeout( function () {
        document.getElementById('toolbox_toggle_button').classList.remove('dragging_no_click');
        toolbox_button_is_stationary = true;
      }, 200);

      // reset commit switch for next drag
      this.commit_switch = 1;
    } // end of stop
  }); // end of toolbox_container draggable



/*
*   Draggers
*
*
*/

/*
*   Draggers
*     resize
*/

  $('#resize_dragger').draggable({
    containment: 'parent',
    scroll: false,
    start: function () {
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
      // socket to other clients
      socket.emit('clientemit_restore_filter', this.image_id);
      // save to database
      this.socketdata.image_filename  = this.image_element.getAttribute('title');
      // socket to other clients
      socket.emit('clientemit_store_resized', this.socketdata);
    }
  }); // end of draggable

/*
*   Draggers
*     opacity
*/

  $('#opacity_dragger').draggable({
    containment: 'parent',
    scroll: false,
    start: function () {
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
      // save to database
      this.socketdata.image_filename  = this.image_element.getAttribute('title');
      //      this.socketdata.current_opacity = this.percentage_wide;
      socket.emit('clientemit_store_opacity', this.socketdata);
    }
  }); // end of draggable

/*
*   Draggers
*     rotate
*/

  $('#rotation_dragger').draggable({
    containment: 'parent',
    scroll: false,
    start: function () {
      // prepare dom elements for manipulation
      this.image_id      = selected_file.image_id;
      this.image_element = document.getElementById(selected_file.image_id);
      // prepare the socketdata
      this.socketdata = {};
      this.socketdata.image_id = this.image_id;
      // gather selected_image stats
      this.scale = this.image_element.getAttribute('data-scale');
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
      // display the percentages in the dragger_info div
      this.dragger_info.textContent = 'rotation:' + this.new_rotation.toFixed(2) + 'deg';
      // make the calculated changes
      this.image_element.style.transform = 'rotate(' + this.new_rotation + 'deg) scale(' + this.scale + ')';
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
      // send to socket
      this.socketdata.scale = this.scale.toString();
      this.socketdata.angle = this.new_rotation.toString();
      socket.emit('clientemit_store_scale_angle', this.socketdata);
    }
  }); // end of draggable

/*
*   Draggers
*     grayscale/invert
*/

  $('#grayscale_invert_dragger').draggable({
    containment: 'parent',
    scroll: false,
    start: function () {
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
      // save to database
      this.socketdata.image_filename  = this.image_element.getAttribute('title');
      socket.emit('clientemit_store_filter', this.socketdata);
    }
  }); // end of draggable

/*
*   Draggers
*     blur/brightness
*/

  $('#blur_brightness_dragger').draggable({
    containment: 'parent',
    scroll: false,
    start: function () {
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
      // save to database
      this.socketdata.image_filename  = this.image_element.getAttribute('title');
      socket.emit('clientemit_store_filter', this.socketdata);
    }
  }); // end of draggable

/*
*   Draggers
*     contrast/saturate
*/

  $('#contrast_saturate_dragger').draggable({
    containment: 'parent',
    scroll: false,
    start: function () {
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
      // save to database
      this.socketdata.image_filename  = this.image_element.getAttribute('title');
      socket.emit('clientemit_store_filter', this.socketdata);
    }
  }); // end of draggable

/*
*   Draggers
*     party
*/

  $('#party_dragger').draggable({
    containment: 'parent',
    scroll: false,
    start: function () {
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
      // save to database
      this.socketdata.image_filename  = this.image_element.getAttribute('title');
      this.socketdata.image_id = this.image_id;
      socket.emit('clientemit_store_opacity', this.socketdata);
      socket.emit('clientemit_store_filter', this.socketdata);
    }
  }); // end of draggable

/*
*   Set dragger locations
*/

  function set_dragger_locations(id) {

    if (document.getElementById('resize_dragger_switch').classList.contains('switchon')) {
      set_resize_dragger_to(id);
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
    if (document.getElementById('party_dragger_switch').classList.contains('switchon')) {
      set_party_dragger_to(id);
    };
  }; // end of set_dragger_locations

/*
*   Set dragger location
*/

  function set_resize_dragger_to(id) {
    var dragger_element = document.getElementById('resize_dragger'),
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
    // setTimeout was needed because the dragger was still transitioning from no selection to selection
    setTimeout(function () {
      dragger_element.classList.add('dragger_transitions');
    }, 0);
  }; // end of set_resize_dragger_to()

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
  }; // end of set_opacity_dragger_to()

  function set_rotation_dragger_to(id) {
    var dragger_element = document.getElementById('rotation_dragger'),
      image_element = document.getElementById(id),
      // calculate the dragger location
      dragger_location_left = parseFloat(image_element.getAttribute('data-angle') / 360 * inner_width);

    /*
    console.log(image_element.style.transform);
    // returns rotate(x) scale (y);

    console.log($('#' + id).css('transform'));
    // returns matrix

    // code which uses the matrix rather than the rotate(x) scale(y) to retrieve the angle
          var image_transform = $('#' + id).css('transform').split('(')[1],
          image_transform = image_transform.split(')')[0],
          image_transform = image_transform.split(','),
          m0_x_zoom = image_transform[0],
          m1_x_skew = image_transform[1];
    //      m2_y_skew = image_transform[2],
    //      m3_y_zoom = image_transform[3],
    //      m4_x_translate = image_transform[4],
    //      m5_y_translate = image_transform[5],
          // calculate the angle from values in the matrix
          var angle = Math.atan2(m1_x_skew, m0_x_zoom) * (180 / Math.PI);
        if (angle < 0) {
          angle = (360 + angle);
        };
        // calculate the dragger location
        dragger_location_left = angle / 360 * inner_width;
    */

    // set the dragger location
    dragger_element.style.left    = dragger_location_left + 'px';
    dragger_element.style.top     = inner_height / 3 + 'px';
    dragger_element.style.display = 'block';
    // allow transitions
    setTimeout(function () {
      dragger_element.classList.add('dragger_transitions');
    }, 0);
  }; // end of set_rotation_dragger_to()

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

      /* This would be necessary if the image did not have a current grayscale in its transform string.
      // However, this app requires that images have a full filter string
         if (grayscale_matches === null) {
         grayscale_matches = ['0', '0'];
         };
      */

    // set the dragger location
    dragger_element.style.left    = dragger_location_left + 'px';
    dragger_element.style.top     = dragger_location_top + 'px';
    dragger_element.style.display = 'block';
    // allow transitions
    setTimeout(function () {
      dragger_element.classList.add('dragger_transitions');
    }, 0);
  }; // end of set_grayscale_invert_dragger_to()

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
  }; // end of set_blur_brightness_dragger_to()

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
  }; // end of set_contrast_saturate_dragger_to()

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
  }; // end of set_party_dragger_to()


}); // end of document.ready
