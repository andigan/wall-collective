import pageSettings from './page-settings';
import stateChange from '../views/state-change';


export function pageInit() {

  // temporary fix: change auto height to percentage
  Array.from(document.getElementsByClassName('wallPic')).forEach(function (element) {
    if (element.style.height === 'auto') {
      element.style.height = ((parseInt(window.getComputedStyle(element).height) / pageSettings.imagesHigh * 100).toFixed(2)) + '%';
    };
  });

  // // prevent default behavior to prevent iphone dragging and bouncing
  // // http://www.quirksmode.org/mobile/default.html
  // document.ontouchmove = function (event) {
  //   event.preventDefault();
  // };

  // process any click on the wrapper
  document.getElementById('wrapper').onclick = function (event) {
    var draggerEls = {};

    document.getElementById('color-chooser').style.display = 'none';

    // if the images div alone is clicked...
    if (event.target.getAttribute('id') === 'images') {
      draggerEls = document.getElementsByClassName('dragger');
      // remove all draggers
      stateChange.hideDraggers();
      // close button containers and remove d-transition
      document.body.classList.remove('d-transition');
    };
  };
}
