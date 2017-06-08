import config from '../_config/config';
import pageVars from '../_config/page-vars';
import stateChange from '../scripts/state-change';
import { clearSelectedImage } from '../actions';

module.exports = {
  init: function () {

    let imagesEl = document.getElementById('images');

    // // prevent default behavior to prevent iphone dragging and bouncing
    // // http://www.quirksmode.org/mobile/default.html
    // document.ontouchmove = function (event) {
    //   event.preventDefault();
    // };

    // add perspective to 3d transforms
    imagesEl.style.webkitPerspective = '500px';
    imagesEl.style.webkitPerspectiveOriginX = '50%';
    imagesEl.style.webkitPerspectiveOriginY = '50%';

    function clickSansTarget() {
      // remove color-chooser box
      document.getElementById('color-chooser').style.display = 'none';

      // remove all draggers
      stateChange.hideDraggers();
      window.store.dispatch(clearSelectedImage());
      // remove dragger transitions
      // so that the draggers appear instantly instead of transitioning from previous position
      document.body.classList.remove('d-transition');
    }

    document.getElementById('wrapper').onclick = function (e) {
      let clickedId = e.target.getAttribute('id');

      // if the images div alone is clicked...
      if (clickedId === 'wrapper' || clickedId === 'images') {
        clickSansTarget();
      };
    };

    this.render();

    // listen for resize and orientation changes and make adjustments
    window.addEventListener('resize', () => {
      this.render();
    }, false);
  },



  calculateAspectRatioFit: function (srcWidth, srcHeight, maxWidth, maxHeight) {
    var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

    return { width: srcWidth * ratio, height: srcHeight * ratio };
  },



  render: function () {
    let navToggleEl = document.getElementById('nav-toggle-button-container'),
        imagesEl = document.getElementById('images'),
        wrapperEl = document.getElementById('wrapper'),
        aspectFit = {};

    // change page size values
    pageVars.changeMainXY(window.innerWidth, window.innerHeight);

    // set wrapper size. (css vh and vw were not working with mobile safari)
    wrapperEl.style.width = pageVars.mainWide + 'px';
    wrapperEl.style.height = pageVars.mainHigh + 'px';

    // position the nav-toggle-button-container on the bottom right
    navToggleEl.style.left = (pageVars.mainWide - parseFloat(window.getComputedStyle(navToggleEl).width) + 'px');
    navToggleEl.style.top = (pageVars.mainHigh - parseFloat(window.getComputedStyle(navToggleEl).height) + 'px');


    // set images container size; maintain aspect ratio
    aspectFit = this.calculateAspectRatioFit(config.ar.width, config.ar.height, pageVars.mainWide, pageVars.mainHigh);

    // change settings
    pageVars.changeImagesXY(aspectFit.width, aspectFit.height);

    // change el
    imagesEl.style.height = pageVars.imagesHigh + 'px';
    imagesEl.style.width = pageVars.imagesWide + 'px';

    // center images el vertically
    imagesEl.style.top = ((pageVars.mainHigh - pageVars.imagesHigh) / 2) + 'px';

    pageVars.changeDLimits(config.dLimits.top, config.dLimits.bottom, config.dLimits.left, config.dLimits.right);
  }

};
