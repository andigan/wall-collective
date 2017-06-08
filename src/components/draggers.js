import config from '../_config/config';
import dData from '../_config/config-draggers';
import pageVars from '../_config/page-vars';
import Grid from './grid';
import stateChange from '../scripts/state-change';
import { resetClickCount } from '../actions';

export function createDraggers() {
  let draggersEl = document.getElementById('draggers');

  dData.forEach(function (d) {
    let draggerEl = document.createElement('div'),
        iconContainerEl = document.createElement('div'),
        iconEl = document.createElement('img'),
        wrapperEl = document.getElementById('wrapper');

    draggerEl.id = `dragger-${d.name}`;
    draggerEl.classList.add('dragger', 'd-transition');
    draggerEl.style.backgroundColor = d.color;
    draggerEl.style.boxShadow = '0 0 2px 2px ' + d.shadowColor;

    iconContainerEl.classList.add('d-icon-container');
    iconContainerEl.style.backgroundColor = d.color;

    iconEl.classList.add('d-icon');

    iconEl.src = d.icon;

    iconContainerEl.appendChild(iconEl);

    draggerEl.appendChild(iconContainerEl);
    draggersEl.appendChild(draggerEl);
  });

  pageVars.setDXY();

}

// dragger API
export function draggersInit() {

  var draggerAPI = {

    socketdata: {
      imageID: '',
      imageEl: '',
      filename: ''
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
      this.socketdata.filename = this.imageEl.getAttribute('title');

      this.dInfo = document.getElementById('grid-info');
    },

    updateInfo: function (message) {
      this.dInfo.textContent = message;
    },

    getPos: function (position) {

      return { x: (((position.left + pageVars.dWidth / 2) - pageVars.dLimits.inleft) / pageVars.dLimits.inwidth * 100).toFixed(2),
               y: ((pageVars.dLimits.inheight - ((position.top + pageVars.dHeight / 2) - pageVars.dLimits.intop)) / pageVars.dLimits.inheight * 100).toFixed(2) };
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
    },

    limitDrag(ui) {
      // top
      if (ui.position.top < pageVars.dLimits.top) {
        ui.position.top = pageVars.dLimits.top;
      };
      // bottom
      if (ui.position.top > pageVars.dLimits.bottom - pageVars.dHeight) {
        ui.position.top = pageVars.dLimits.bottom - pageVars.dHeight;
      };
      // left
      if (ui.position.left < pageVars.dLimits.left) {
        ui.position.left = pageVars.dLimits.left;
      };
      // right
      if (ui.position.left > pageVars.dLimits.right - pageVars.dWidth) {
        ui.position.left = pageVars.dLimits.right - pageVars.dWidth;
      };
    }
  };


// draggable draggers

  $('#dragger-stretch').draggable({
    scroll: false,
    start: function () {
      draggerAPI.start(this);
      draggerAPI.removeFilter();

      this.imageCenterX = parseFloat(draggerAPI.imageEl.style.left) + (parseFloat(draggerAPI.imageEl.style.width) / 2);
      this.imageCenterY = parseFloat(draggerAPI.imageEl.style.top) + (parseFloat(draggerAPI.imageEl.style.height) / 2);
    },
    drag: function (event, ui) {

      draggerAPI.limitDrag(ui);

      let draggerPos = draggerAPI.getPos(ui.position),
          newWidth = draggerPos.x,
          newHeight = draggerPos.y,
          newLeft = this.imageCenterX - (newWidth / 2),
          newTop = this.imageCenterY - (newHeight / 2);

      draggerAPI.updateInfo(`width: ${draggerPos.x}% height: ${draggerPos.y}%`);

      draggerAPI.changeStyle({width: newWidth + '%', height: newHeight + '%', left: newLeft + '%', top: newTop + '%'});

      draggerAPI.socketdata.transform = draggerAPI.imageEl.style.transform;
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
    scroll: false,
    start: function () {
      draggerAPI.start(this);
    },
    drag: function (event, ui) {
      draggerAPI.limitDrag(ui);

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
    scroll: false,
    start: function () {
      draggerAPI.start(this);
    },
    drag: function (event, ui) {
      draggerAPI.limitDrag(ui);

      let draggerPos = draggerAPI.getPos(ui.position);

      this.newRotation = Math.round(draggerPos.x * 3.6);
      this.newRotateZ = Math.round((100 - draggerPos.y) * 3.6);

      draggerAPI.updateInfo(`rotation: ${this.newRotation.toFixed(0)}\xB0 rotateZ: ${this.newRotateZ.toFixed(0)}\xB0`);

      draggerAPI.changeTransform({rotate: this.newRotation + 'deg', rotateZ: this.newRotateZ + 'deg'});

      draggerAPI.socketdata.transform = draggerAPI.imageEl.style.transform;
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
    scroll: false,
    start: function () {
      draggerAPI.start(this);
    },
    drag: function (event, ui) {
      draggerAPI.limitDrag(ui);

      let draggerPos = draggerAPI.getPos(ui.position);

      draggerAPI.updateInfo(`grayscale: ${draggerPos.y}% invert: ${draggerPos.x}%`);

      draggerAPI.changeFilter({invert: draggerPos.x / 100, grayscale: draggerPos.y / 100});

      draggerAPI.socketdata.filter = draggerAPI.imageEl.style.WebkitFilter;
      socket.emit('ce:_filterChanging', draggerAPI.socketdata);
    },
    stop: function () {
      draggerAPI.stop();
      socket.emit('ce:_saveFilter', draggerAPI.socketdata);
    }
  });

  $('#dragger-blur_brightness').draggable({
    scroll: false,
    start: function () {
      draggerAPI.start(this);
    },
    drag: function (event, ui) {
      draggerAPI.limitDrag(ui);

      let draggerPos = draggerAPI.getPos(ui.position),
          brightness = (draggerPos.x / 100 * config.brightnessLevel).toFixed(2),
          blur = ((1 - draggerPos.y / 100) * config.blurLevel).toFixed(2);

      draggerAPI.updateInfo(`blur: ${blur}px brightness: ${brightness}`);

      draggerAPI.changeFilter({blur: blur + 'px', brightness: brightness});

      draggerAPI.socketdata.filter = draggerAPI.imageEl.style.WebkitFilter;
      socket.emit('ce:_filterChanging', draggerAPI.socketdata);
    },
    stop: function () {
      draggerAPI.stop();
      socket.emit('ce:_saveFilter', draggerAPI.socketdata);
    }
  });

  $('#dragger-contrast_saturate').draggable({
    scroll: false,
    start: function () {
      draggerAPI.start(this);
    },
    drag: function (event, ui) {
      draggerAPI.limitDrag(ui);

      let draggerPos = draggerAPI.getPos(ui.position),
          saturate = (draggerPos.x / 100 * config.saturateLevel).toFixed(2),
          contrast = ((1 - draggerPos.y / 100) * config.contrastLevel).toFixed(2);

      draggerAPI.updateInfo(`contrast: ${contrast} saturate: ${saturate}`);

      draggerAPI.changeFilter({contrast: contrast, saturate: saturate});

      draggerAPI.socketdata.filter = draggerAPI.imageEl.style.WebkitFilter;
      socket.emit('ce:_filterChanging', draggerAPI.socketdata);
    },
    stop: function () {
      draggerAPI.stop();
      socket.emit('ce:_saveFilter', draggerAPI.socketdata);
    }
  });

  $('#dragger-party').draggable({
    scroll: false,
    start: function () {
      draggerAPI.start(this);
    },
    drag: function (event, ui) {
      draggerAPI.limitDrag(ui);

      let draggerPos = draggerAPI.getPos(ui.position),
          opacity = draggerPos.x < 50 ? (draggerPos.x * 0.02).toFixed(2) : (1 - (draggerPos.x - 50) * 0.02).toFixed(2),
          hueRotate = draggerPos.y < 50 ? (360 - draggerPos.y * 7.2).toFixed(2) : (draggerPos.y * 7.2 - 360).toFixed(2);

      draggerAPI.updateInfo(`opacity: ${(opacity * 100).toFixed(0)}% hue-rotation: ${hueRotate}\xB0`);

      draggerAPI.changeStyle({'opacity': opacity});
      draggerAPI.changeFilter({'hue-rotate': hueRotate + 'deg'});

      draggerAPI.socketdata.imageOpacity = opacity;
      socket.emit('ce:_opacityChanging', draggerAPI.socketdata);
      draggerAPI.socketdata.filter = draggerAPI.imageEl.style.WebkitFilter;
      socket.emit('ce:_filterChanging', draggerAPI.socketdata);
    },
    stop: function () {
      draggerAPI.stop();
      socket.emit('ce:_saveOpacity', draggerAPI.socketdata);
      socket.emit('ce:_saveFilter', draggerAPI.socketdata);
    }
  });

  $('#dragger-threeD').draggable({
    scroll: false,
    start: function () {
      draggerAPI.start(this);
    },
    drag: function (event, ui) {
      draggerAPI.limitDrag(ui);

      let draggerPos = draggerAPI.getPos(ui.position);

      this.rotateX = ((draggerPos.y * 3.6) - 180).toFixed(2),
      this.rotateY = ((draggerPos.x * 3.6) - 180).toFixed(2);

      // display the percentages in the grid-info div
      draggerAPI.updateInfo(`rotateX: ${this.rotateX}\xB0 rotateY: ${this.rotateY}\xB0`);

      draggerAPI.changeTransform({rotateX: this.rotateX + 'deg', rotateY: this.rotateY + 'deg'});

      // socket to other clients
      draggerAPI.socketdata.transform = draggerAPI.imageEl.style.transform;
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
    dData.forEach(function (sw) {
      if (document.getElementById('switch-' + sw.name).classList.contains('switchon')) {
        sw.handler(id);
      }
    });
  };
}

// set dragger helpers

// set the dragger location within inner limits using percentages normalized between 0 and 1
function setDraggerLoc(draggerEl, x, y) {
  draggerEl.style.left = `${pageVars.dLimits.left + x * pageVars.dLimits.inwidth}px`;
  draggerEl.style.top = `${pageVars.dLimits.top + y * pageVars.dLimits.inheight}px`;
}

// get the number within the parentheses before the value from the string
function getValue(value, string) {
  let x = new RegExp(value + '\\(.*?\\)'),
      y = x.exec(string)[0],
      z = y.replace(')','').replace('(', '').replace(value, '');

  return parseFloat(z);
}

function showDragger(draggerEl) {

  draggerEl.style.display = 'block';
  draggerEl.classList.add('d-on');

  // setTimeout is needed because the dragger will otherwise transition from no selection to selection
  setTimeout(function () {
    draggerEl.classList.add('d-transition');
  }, 0);
}


// set dragger locations
export function setStretchD(id) {
  let draggerEl = document.getElementById('dragger-stretch'),
      imageEl = document.getElementById(id);

  setDraggerLoc(draggerEl, parseFloat(imageEl.style.width) / 100, 1 - parseFloat(imageEl.style.height) / 100);
  showDragger(draggerEl);
};

export function setOpacityD(id) {
  let draggerEl = document.getElementById('dragger-opacity'),
      imageEl = document.getElementById(id);

  setDraggerLoc(draggerEl, imageEl.style.opacity, 0);
  showDragger(draggerEl);
};

export function setRotationD(id) {
  let draggerEl = document.getElementById('dragger-rotation'),
      imageEl = document.getElementById(id);

  setDraggerLoc(draggerEl, parseFloat(imageEl.getAttribute('data-angle')) / 360, parseFloat(imageEl.getAttribute('data-rotateZ')) / 360);
  showDragger(draggerEl);
};

export function setGrayscaleInvertD(id) {
  let draggerEl = document.getElementById('dragger-grayscale_invert'),
      imageEl = document.getElementById(id),
      imageFilter = imageEl.style.WebkitFilter;

  setDraggerLoc(draggerEl, getValue('invert', imageFilter), 1 - getValue('grayscale', imageFilter));
  showDragger(draggerEl);
};

export function setBlurBrightnessD(id) {
  let draggerEl = document.getElementById('dragger-blur_brightness'),
      imageEl = document.getElementById(id),
      imageFilter = imageEl.style.WebkitFilter;

  setDraggerLoc(draggerEl, getValue('brightness', imageFilter) / config.brightnessLevel, getValue('blur', imageFilter) / config.blurLevel);
  showDragger(draggerEl);
};

export function setContrastSaturateD(id) {
  let draggerEl = document.getElementById('dragger-contrast_saturate'),
      imageEl = document.getElementById(id),
      imageFilter = imageEl.style.WebkitFilter;

  setDraggerLoc(draggerEl, getValue('saturate', imageFilter) / config.saturateLevel, getValue('contrast', imageFilter) / config.contrastLevel);
  showDragger(draggerEl);
};

export function setPartyD(id) {
  let draggerEl = document.getElementById('dragger-party'),
      imageEl = document.getElementById(id),

      imageFilter = imageEl.style.WebkitFilter,
      opacity = parseInt( imageEl.style.opacity * 100) / 100,

      isLeft = (draggerEl.offsetLeft + pageVars.dWidth / 2 < pageVars.dLimits.inmiddlex),
      isTop = (draggerEl.offsetTop + pageVars.dHeight / 2 < pageVars.dLimits.inmiddley),

      adjustedY = isTop ? ((1 - (getValue('hue-rotate', imageFilter) / 360)) / 2 ).toFixed(2) : (0.5 + getValue('hue-rotate', imageFilter) / 720).toFixed(2),
      adjustedZ = isLeft ? opacity / 2 : 1 - opacity / 2;

  setDraggerLoc(draggerEl, adjustedZ, adjustedY);
  showDragger(draggerEl);
};

export function setThreeDD(id) {
  let draggerEl = document.getElementById('dragger-threeD'),
      imageEl = document.getElementById(id),
      x = (( 180 + parseFloat(imageEl.getAttribute('data-rotateY')) ) / 360),
      y = 1 - (( 180 + parseFloat(imageEl.getAttribute('data-rotateX')) ) / 360);

  setDraggerLoc(draggerEl, x, y);
  showDragger(draggerEl);
};
