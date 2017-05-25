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

    document.getElementById('color-chooser').style.display = 'none';

    // if the images div alone is clicked...
    if (event.target.getAttribute('id') === 'wrapper' || event.target.getAttribute('id') === 'images') {
      // remove all draggers
      stateChange.hideDraggers();
      // close button containers and remove d-transition
      document.body.classList.remove('d-transition');
    };
  };
}
