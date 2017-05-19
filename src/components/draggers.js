import config from '../_config/config';
import pageSettings from '../_init/page-settings';
import Grid from './grid';
import stateChange from '../views/state-change';
import { resetClickCount } from '../actions';


function set_stretch_dragger_to(id) {
  var dragger_element = document.getElementById('dragger-stretch'),
      imageEl = document.getElementById(id),

      // get the width and height
      selected_imageWidth = parseFloat(imageEl.style.width),
      selected_imageHeight = parseFloat(imageEl.style.height),

      // calculate the dragger location
      selected_imageWidth_percentage  = selected_imageWidth / 100,
      selected_imageHeight_percentage = selected_imageHeight / 100,
      draggerLeft = selected_imageWidth_percentage * pageSettings.innerWidth,
      draggerTop = (1 - selected_imageHeight_percentage) * pageSettings.innerHeight;

  // set the dragger location
  dragger_element.style.left    = draggerLeft + 'px';
  dragger_element.style.top     = draggerTop + 'px';
  dragger_element.style.display = 'block';

  // allow transitions
  // setTimeout is needed because the dragger will otherwise transition from no selection to selection
  setTimeout(function () {
    dragger_element.classList.add('d-transition');
  }, 0);
};

function set_opacity_dragger_to(id) {
  var dragger_element = document.getElementById('dragger-opacity'),
      imageEl = document.getElementById(id),
      // get the opacity percentage: 0-1
      selected_image_opacity = parseInt( imageEl.style.opacity * 100) / 100,
      // calculate the dragger location
      draggerLeft = (selected_image_opacity * pageSettings.innerWidth);

  // set the dragger location
  dragger_element.style.left = draggerLeft + 'px';
//  dragger_element.style.top = (pageSettings.innerHeight / 3 * 2) + 'px';
  dragger_element.style.display = 'block';
  // allow transitions
  setTimeout(function () {
    dragger_element.classList.add('d-transition');
  }, 0);
};

function set_rotation_dragger_to(id) {
  var dragger_element = document.getElementById('dragger-rotation'),
      imageEl = document.getElementById(id),
      // calculate the dragger location
      draggerLeft = parseFloat(imageEl.getAttribute('data-angle') / 360 * pageSettings.innerWidth),
      draggerTop = parseFloat(imageEl.getAttribute('data-rotateZ') / 360 * pageSettings.innerHeight);

  // set the dragger location
  dragger_element.style.left = draggerLeft + 'px';
  dragger_element.style.top = draggerTop + 'px';
  dragger_element.style.display = 'block';
  // allow transitions
  setTimeout(function () {
    dragger_element.classList.add('d-transition');
  }, 0);
};

function set_grayscale_invert_dragger_to(id) {
  var dragger_element = document.getElementById('dragger-grayscale_invert');
  var imageEl = document.getElementById(id);
      // get the filter. example: ('grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)')
  var selected_image_filter = imageEl.style.WebkitFilter;
      // get the numbers within the grayscale and invert parentheses

//        console.log(imageEl);


  var grayscale_Exp = /grayscale\(([^)]+)\)/,
      invert_Exp = /invert\(([^)]+)\)/,
      grayscale_matches = grayscale_Exp.exec(selected_image_filter),
      invert_matches    = invert_Exp.exec(selected_image_filter),
      // calculate the dragger location
      draggerTop = ((1 - parseFloat(grayscale_matches[1])) * pageSettings.innerHeight),
      draggerLeft = (parseFloat(invert_matches[1]) * pageSettings.innerWidth);




  // set the dragger location
  dragger_element.style.left    = draggerLeft + 'px';
  dragger_element.style.top     = draggerTop + 'px';
  dragger_element.style.display = 'block';
  // allow transitions
  setTimeout(function () {
    dragger_element.classList.add('d-transition');
  }, 0);
};

function set_blur_brightness_dragger_to(id) {
  var dragger_element = document.getElementById('dragger-blur_brightness'),
      imageEl = document.getElementById(id),
      // get the filter. example: ('grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)')
      selected_image_filter = imageEl.style.WebkitFilter,
      // get the numbers within the blur and brightness parentheses
      blur_Exp = /blur\(([^)]+)\)/,
      brightness_Exp = /brightness\(([^)]+)\)/,
      blur_matches = blur_Exp.exec(selected_image_filter),
      brightness_matches    = brightness_Exp.exec(selected_image_filter),
      // calculate the dragger location
      draggerTop = (parseFloat(blur_matches[1]) * pageSettings.innerHeight / config.blurLevel),
      draggerLeft = (parseFloat(brightness_matches[1]) * pageSettings.innerWidth / config.brightnessLevel);

  // set the dragger location
  dragger_element.style.left    = draggerLeft + 'px';
  dragger_element.style.top     = draggerTop + 'px';
  dragger_element.style.display = 'block';
  // allow transitions
  setTimeout(function () {
    dragger_element.classList.add('d-transition');
  }, 0);
};

function set_contrast_saturate_dragger_to(id) {
  var dragger_element = document.getElementById('dragger-contrast_saturate'),
      imageEl = document.getElementById(id),
      // get the filter. example: ('grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)')
      selected_image_filter = imageEl.style.WebkitFilter,
      // get the numbers within the contrast and saturate parentheses
      contrast_Exp = /contrast\(([^)]+)\)/,
      saturate_Exp = /saturate\(([^)]+)\)/,
      contrast_matches = contrast_Exp.exec(selected_image_filter),
      saturate_matches = saturate_Exp.exec(selected_image_filter),
      // calculate the dragger location
      draggerTop = (parseFloat(contrast_matches[1]) * pageSettings.innerHeight / config.contrastLevel),
      draggerLeft = (parseFloat(saturate_matches[1]) * pageSettings.innerWidth / config.saturateLevel);

  // set the dragger location
  dragger_element.style.left    = draggerLeft + 'px';
  dragger_element.style.top     = draggerTop + 'px';
  dragger_element.style.display = 'block';
  // allow transitions
  setTimeout(function () {
    dragger_element.classList.add('d-transition');
  }, 0);
};

function set_party_dragger_to(id) {
  var dragger_element = document.getElementById('dragger-party'),
      imageEl = document.getElementById(id),
      // get the filter. example: ('grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)')
      // and opacity percentage: (0-1)
      selected_image_filter = imageEl.style.WebkitFilter,
      selected_image_opacity = parseInt( imageEl.style.opacity * 100) / 100,
      // get the number within the hue-rotation parentheses
      hue_rotate_Exp = /hue-rotate\(([^)]+)\)/,
      hue_rotate_matches = hue_rotate_Exp.exec(selected_image_filter),
      // calculate the dragger location
      draggerLeft = (selected_image_opacity * pageSettings.innerWidth),
      draggerTop = (pageSettings.innerHeight - (parseFloat(hue_rotate_matches[1]) / 360 * pageSettings.innerHeight));

  // set the dragger location
  dragger_element.style.left    = draggerLeft + 'px';
  dragger_element.style.top     = draggerTop + 'px';
  dragger_element.style.display = 'block';
  // allow transitions
  setTimeout(function () {
    dragger_element.classList.add('d-transition');
  }, 0);
};

function set_threeD_dragger_to(id) {
  var dragger_element = document.getElementById('dragger-threeD'),
    imageEl = document.getElementById(id),
    // calculate the dragger location
    draggerTop = pageSettings.innerHeight - ((( 180 + parseFloat(imageEl.getAttribute('data-rotateX')) ) / 360) * pageSettings.innerHeight),
    draggerLeft = (( 180 + parseFloat(imageEl.getAttribute('data-rotateY')) ) / 360) * pageSettings.innerWidth;

  // set the dragger location
  dragger_element.style.left    = draggerLeft + 'px';
  dragger_element.style.top     = draggerTop + 'px';
  dragger_element.style.display = 'block';
  // allow transitions
  setTimeout(function () {
    dragger_element.classList.add('d-transition');
  }, 0);
};

export function draggersInit() {

  var draggerAPI = {

    socketdata: {
      imageID: '',
      imageEl: '',
      imageFilename: ''
    },

    start(dragger) {
      this.dragger = dragger;
      Grid.make_grid();
      stateChange.hideOtherDraggers(dragger.id);
      dragger.classList.remove('d-transition');

      this.imageID = window.store.getState().selectedImage.id;
      this.imageEl = document.getElementById(this.imageID);

      this.socketdata.imageID = this.imageID;
      this.socketdata.imageEl = this.imageEl;
      this.socketdata.imageFilename = this.imageEl.getAttribute('title');

      this.dInfo = document.getElementById('d-info');
    },

    updateInfo: function (message) {
      this.dInfo.textContent = message;
    },

    getPos: function (position) {
      return { x: (position.left / pageSettings.innerWidth * 100).toFixed(2),
               y: ((pageSettings.innerHeight - position.top) / pageSettings.innerHeight * 100).toFixed(2) };
    },

    drag: function () {

    },

    stop: function () {
      Grid.remove_grid();
      this.dragger.classList.add('d-transition');
      setDraggerLocations(this.imageID);
      window.store.dispatch(resetClickCount());
    },

    changeStyle(changes) {
      Object.keys(changes).forEach((styleKey) => {
        this.imageEl.style[styleKey] = changes[styleKey];
      });
    },

    changeTransform(changes) {
      Object.keys(changes).forEach((transformKey) => {
        let regex = new RegExp(transformKey + '\\(.*?\\)');

        this.imageEl.style.transform = this.imageEl.style.transform.replace(regex, transformKey + '(' + changes[transformKey] + ')');
      });
    },

    changeFilter(changes) {
      Object.keys(changes).forEach((filterKey) => {
        let regex = new RegExp(filterKey + '\\(.*?\\)');

        this.imageEl.style.WebkitFilter = this.imageEl.style.WebkitFilter.replace(regex, filterKey + '(' + changes[filterKey] + ')');
      });
    },

    removeFilter: function () {
      // put the filter in a data attribute and remove filter
      // --sometimes necessary because dragging images with filter causes rendering lag
      this.imageEl.setAttribute('data-filter', this.imageEl.style.WebkitFilter);
      this.imageEl.style.WebkitFilter = '';
      socket.emit('ce:_removeFilter', this.imageID);
    },

    restoreFilter: function () {
      this.imageEl.style.WebkitFilter = this.imageEl.getAttribute('data-filter');
      this.imageEl.removeAttribute('data-filter');
      socket.emit('ce:_restoreFilter', this.imageID);
    }

  };







    $('#dragger-stretch').draggable({
      containment: 'parent',
      scroll: false,
      start: function () {
        draggerAPI = draggerAPI;
        draggerAPI.start(this);
        draggerAPI.removeFilter();

        this.imageCenterX = parseFloat(draggerAPI.imageEl.style.left) + (parseFloat(draggerAPI.imageEl.style.width) / 2);
        this.imageCenterY = parseFloat(draggerAPI.imageEl.style.top) + (parseFloat(draggerAPI.imageEl.style.height) / 2);
      },
      drag: function (event, ui) {
        let draggerPos = draggerAPI.getPos(ui.position),
            newWidth = draggerPos.x,
            newHeight = draggerPos.y,
            newLeft = this.imageCenterX - (newWidth / 2),
            newTop = this.imageCenterY - (newHeight / 2);

        draggerAPI.updateInfo(`width: ${draggerPos.x}% height: ${draggerPos.y}%`);

        draggerAPI.changeStyle({width: newWidth + '%', height: newHeight + '%', left: newLeft + '%', top: newTop + '%'});

        draggerAPI.socketdata.imageTransform = draggerAPI.imageEl.style.transform;
        draggerAPI.socketdata.imageWidth     = newWidth + '%';
        draggerAPI.socketdata.imageHeight    = newHeight + '%';
        draggerAPI.socketdata.imageLeft      = newLeft + '%';
        draggerAPI.socketdata.imageTop       = newTop + '%';
        socket.emit('ce:_resizing', draggerAPI.socketdata);
      },
      stop: function () {
        draggerAPI.restoreFilter();
        draggerAPI.stop();

        // save to database
        socket.emit('ce:_saveResize', draggerAPI.socketdata);
      }
    });


    $('#dragger-opacity').draggable({
      containment: 'parent',
      scroll: false,
      start: function () {
        draggerAPI.start(this);
      },
      drag: function (event, ui) {
        let draggerPos = draggerAPI.getPos(ui.position);

        draggerAPI.updateInfo(`opacity: ${draggerPos.x}%`);

        draggerAPI.changeStyle({'opacity': draggerPos.x / 100});

        draggerAPI.socketdata.imageOpacity = draggerPos.x / 100;
        socket.emit('ce:_opacityChanging', draggerAPI.socketdata);
      },
      stop: function () {
        draggerAPI.stop();
        socket.emit('ce:_saveOpacity', draggerAPI.socketdata);
      }
    });

    $('#dragger-rotation').draggable({
      containment: 'parent',
      scroll: false,
      start: function () {
        draggerAPI.start(this);
      },
      drag: function (event, ui) {
        let draggerPos = draggerAPI.getPos(ui.position);

        this.newRotation = Math.round(draggerPos.x * 3.6);
        this.newRotateZ = Math.round((100 - draggerPos.y) * 3.6);

        draggerAPI.updateInfo(`rotation: ${this.newRotation.toFixed(2)}deg rotateZ: ${this.newRotateZ.toFixed(2)}deg`);

        draggerAPI.changeTransform({rotate: this.newRotation + 'deg', rotateZ: this.newRotateZ + 'deg'});

        draggerAPI.socketdata.imageTransform = draggerAPI.imageEl.style.transform;
        socket.emit('ce:_transforming', draggerAPI.socketdata);
      },
      stop: function () {
        // store angle in data-angle
        draggerAPI.imageEl.setAttribute('data-angle', this.newRotation.toFixed(2));
        draggerAPI.imageEl.setAttribute('data-rotateZ', this.newRotateZ.toFixed(2));

        draggerAPI.stop();

        // save to database
        socket.emit('ce:_saveTransform', draggerAPI.socketdata);

        // send to socket
        draggerAPI.socketdata.angle = this.newRotation.toString();
        draggerAPI.socketdata.scale = draggerAPI.imageEl.getAttribute('data-scale');
        draggerAPI.socketdata.rotateX = draggerAPI.imageEl.getAttribute('data-rotateX');
        draggerAPI.socketdata.rotateY = draggerAPI.imageEl.getAttribute('data-rotateY');
        draggerAPI.socketdata.rotateZ = draggerAPI.imageEl.getAttribute('data-rotateZ');
        socket.emit('ce:_saveDataAttributes', draggerAPI.socketdata);
      }
    });

    $('#dragger-grayscale_invert').draggable({
      containment: 'parent',
      scroll: false,
      start: function () {
        draggerAPI.start(this);
      },
      drag: function (event, ui) {
        let draggerPos = draggerAPI.getPos(ui.position);

        draggerAPI.updateInfo(`grayscale: ${draggerPos.y}% invert: ${draggerPos.x}%`);

        draggerAPI.changeFilter({invert: draggerPos.x / 100, grayscale: draggerPos.y / 100});

        draggerAPI.socketdata.imageFilter = draggerAPI.imageEl.style.WebkitFilter;
        socket.emit('ce:_filterChanging', draggerAPI.socketdata);
      },
      stop: function () {
        draggerAPI.stop();
        socket.emit('ce:_saveFilter', draggerAPI.socketdata);
      }
    });

    $('#dragger-blur_brightness').draggable({
      containment: 'parent',
      scroll: false,
      start: function () {
        draggerAPI.start(this);
      },
      drag: function (event, ui) {
        let draggerPos = draggerAPI.getPos(ui.position),
            brightness = (draggerPos.x / 100 * config.brightnessLevel).toFixed(2),
            blur = ((1 - draggerPos.y / 100) * config.blurLevel).toFixed(2);

        draggerAPI.updateInfo(`blur: ${blur}px brightness: ${brightness}`);

        draggerAPI.changeFilter({blur: blur + 'px', brightness: brightness});

        draggerAPI.socketdata.imageFilter = draggerAPI.imageEl.style.WebkitFilter;
        socket.emit('ce:_filterChanging', draggerAPI.socketdata);
      },
      stop: function () {
        draggerAPI.stop();
        socket.emit('ce:_saveFilter', draggerAPI.socketdata);
      }
    });

    $('#dragger-contrast_saturate').draggable({
      containment: 'parent',
      scroll: false,
      start: function () {
        draggerAPI.start(this);
      },
      drag: function (event, ui) {
        let draggerPos = draggerAPI.getPos(ui.position),
            saturate = (draggerPos.x / 100 * config.saturateLevel).toFixed(2),
            contrast = ((1 - draggerPos.y / 100) * config.contrastLevel).toFixed(2);

        draggerAPI.updateInfo(`contrast: ${contrast} saturate: ${saturate}`);

        draggerAPI.changeFilter({contrast: contrast, saturate: saturate});

        draggerAPI.socketdata.imageFilter = draggerAPI.imageEl.style.WebkitFilter;
        socket.emit('ce:_filterChanging', draggerAPI.socketdata);
      },
      stop: function () {
        draggerAPI.stop();
        socket.emit('ce:_saveFilter', draggerAPI.socketdata);
      }
    });

    $('#dragger-party').draggable({
      containment: 'parent',
      scroll: false,
      start: function () {
        draggerAPI.start(this);
      },
      drag: function (event, ui) {
        let draggerPos = draggerAPI.getPos(ui.position),
            opacity = (draggerPos.x / 100).toFixed(2),
            hueRotate = (draggerPos.y * 3.6).toFixed(2);

        draggerAPI.updateInfo(`opacity: ${(opacity * 100).toFixed(0)}% hue-rotation: ${hueRotate}`);

        draggerAPI.changeStyle({'opacity': opacity});
        draggerAPI.changeFilter({'hue-rotate': hueRotate + 'deg'});

        draggerAPI.socketdata.imageOpacity = this.draggerXpos;
        socket.emit('ce:_opacityChanging', draggerAPI.socketdata);
        draggerAPI.socketdata.imageFilter = draggerAPI.imageEl.style.WebkitFilter;
        socket.emit('ce:_filterChanging', draggerAPI.socketdata);
      },
      stop: function () {
        draggerAPI.stop();
        socket.emit('ce:_saveOpacity', draggerAPI.socketdata);
        socket.emit('ce:_saveFilter', draggerAPI.socketdata);
      }
    });

    $('#dragger-threeD').draggable({
      containment: 'parent',
      scroll: false,
      start: function () {
        draggerAPI.start(this);
      },
      drag: function (event, ui) {
        let draggerPos = draggerAPI.getPos(ui.position);

        this.rotateX = ((draggerPos.y * 3.6) - 180).toFixed(2),
        this.rotateY = ((draggerPos.x * 3.6) - 180).toFixed(2);

        // display the percentages in the d-info div
        draggerAPI.updateInfo(`rotateX: ${this.rotateX}deg rotateY: ${this.rotateY}deg`);

        draggerAPI.changeTransform({rotateX: this.rotateX + 'deg', rotateY: this.rotateY + 'deg'});

        // socket to other clients
        draggerAPI.socketdata.imageTransform = draggerAPI.imageEl.style.transform;
        socket.emit('ce:_transforming', draggerAPI.socketdata);
      },
      stop: function () {
        draggerAPI.imageEl.setAttribute('data-rotateX', this.rotateX);
        draggerAPI.imageEl.setAttribute('data-rotateY', this.rotateY);

        draggerAPI.stop();

        // save to database
        socket.emit('ce:_saveTransform', draggerAPI.socketdata);

        // send to socket
        draggerAPI.socketdata.scale = draggerAPI.imageEl.getAttribute('data-scale');
        draggerAPI.socketdata.angle = draggerAPI.imageEl.getAttribute('data-angle');
        draggerAPI.socketdata.rotateX = draggerAPI.imageEl.getAttribute('data-rotateX');
        draggerAPI.socketdata.rotateY = draggerAPI.imageEl.getAttribute('data-rotateY');
        draggerAPI.socketdata.rotateZ = draggerAPI.imageEl.getAttribute('data-rotateZ');
        socket.emit('ce:_saveDataAttributes', draggerAPI.socketdata);
      }
    });




}








export function setDraggerLocations(id) {

  if (id) {
    if (document.getElementById('switch-stretch').classList.contains('switchon')) {
      set_stretch_dragger_to(id);
    };
    if (document.getElementById('switch-opacity').classList.contains('switchon')) {
      set_opacity_dragger_to(id);
    };
    if (document.getElementById('switch-rotation').classList.contains('switchon')) {
      set_rotation_dragger_to(id);
    };
    if (document.getElementById('switch-grayscale_invert').classList.contains('switchon')) {
      set_grayscale_invert_dragger_to(id);
    };
    if (document.getElementById('switch-blur_brightness').classList.contains('switchon')) {
      set_blur_brightness_dragger_to(id);
    };
    if (document.getElementById('switch-contrast_saturate').classList.contains('switchon')) {
      set_contrast_saturate_dragger_to(id);
    };
    if (document.getElementById('switch-threeD').classList.contains('switchon')) {
      set_threeD_dragger_to(id);
    };
    if (document.getElementById('switch-party').classList.contains('switchon')) {
      set_party_dragger_to(id);
    };
  };
}
