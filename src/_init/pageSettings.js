

module.exports = {
  init: function () {

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
    let navToggleEl = document.getElementById('navigation_toggle_button_container'),
        closeInfoEl = document.getElementById('close_info_container'),
        appInfoEl = document.getElementById('app_info'),
        closeExploreEl = document.getElementById('close_explore_container'),
        imagesEl = document.getElementById('images'),
        wrapperEl = document.getElementById('wrapper'),
        aspectFit = {};

    // retrieve dragger size from css
    this.draggerWidth = parseFloat(window.getComputedStyle(document.getElementsByClassName('dragger')[0]).width);
    this.draggerHeight = parseFloat(window.getComputedStyle(document.getElementsByClassName('dragger')[0]).height);

    // retrieve window size; calculate dragger limit box size
    this.mainWide = window.innerWidth;
    this.mainHigh = window.innerHeight;

    this.innerWidth = this.mainWide - this.draggerWidth;
    this.innerHeight = this.mainHigh - this.draggerHeight;

    // set wrapper size; (css vh and vw were not working with mobile safari)
    wrapperEl.style.width = this.mainWide + 'px';
    wrapperEl.style.height = this.mainHigh + 'px';

    // set images container size; maintain portrait aspect ratio
    aspectFit = this.calculateAspectRatioFit(320, 460, this.mainWide, this.mainHigh);

    this.imagesHigh = aspectFit.height;
    this.imagesWide = aspectFit.width;
    imagesEl.style.height = this.imagesHigh + 'px';
    imagesEl.style.width = this.imagesWide + 'px';

    // position the navigation_toggle_button_container on the bottom right
    navToggleEl.style.left = (this.mainWide - parseFloat(window.getComputedStyle(navToggleEl).width) + 'px');
    navToggleEl.style.top = (this.mainHigh - parseFloat(window.getComputedStyle(navToggleEl).height) + 'px');

    // set app_info height
    document.getElementById('app_info').style.height = (this.innerHeight * 0.9) + 'px';

    // set explore_container height
    document.getElementById('explore_container').style.height = (this.innerHeight * 0.9) + 'px';

    // set position and size of the close_info container divs
    closeInfoEl.style.width = (parseFloat(window.getComputedStyle(appInfoEl).height) * 0.1) + 'px';
    closeInfoEl.style.height = (parseFloat(window.getComputedStyle(appInfoEl).height) * 0.1) + 'px';
    closeInfoEl.style.top = (this.mainHigh * 0.05) + (parseFloat(window.getComputedStyle(appInfoEl).height) - parseInt(closeInfoEl.style.height)) + 'px';

    // set position and size of the x_icon container divs
    closeExploreEl.style.width = (parseFloat(window.getComputedStyle(appInfoEl).height) * 0.1) + 'px';
    closeExploreEl.style.height = (parseFloat(window.getComputedStyle(appInfoEl).height) * 0.1) + 'px';
    closeExploreEl.style.top = (this.mainHigh * 0.05) + (parseFloat(window.getComputedStyle(appInfoEl).height) - parseInt(closeInfoEl.style.height)) + 'px';

    // add perspective to 3d transforms
    imagesEl.style.webkitPerspective = '500px';
    imagesEl.style.webkitPerspectiveOriginX = '50%';
    imagesEl.style.webkitPerspectiveOriginY = '50%';
  }
};
