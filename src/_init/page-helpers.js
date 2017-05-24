import config from '../_config/config.js';
import stateChange from '../views/state-change';


export function pageInit() {

  // // prevent default behavior to prevent iphone dragging and bouncing
  // // http://www.quirksmode.org/mobile/default.html
  // document.ontouchmove = function (event) {
  //   event.preventDefault();
  // };

  config.uploadTotal = 0;

  // process any click on the wrapper
  document.getElementById('wrapper').onclick = function (event) {
    var draggerEls = {};

    document.getElementById('color-chooser').style.display = 'none';

    // if the images div alone is clicked...
    if (event.target.getAttribute('id') === 'wrapper') {
      draggerEls = document.getElementsByClassName('dragger');
      // remove all draggers
      stateChange.hideDraggers();
      // close button containers and remove d-transition
      document.body.classList.remove('d-transition');
    };
  };
}
