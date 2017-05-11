module.exports = {
  init: function () {

    this.render();

    // add perspective to 3d transforms
    let imagesEl = document.getElementById('images');

    imagesEl.style.width = window.innerWidth + 'px';
    imagesEl.style.height = window.innerHeight + 'px';
    imagesEl.style.webkitPerspective = '500px';
    imagesEl.style.webkitPerspectiveOriginX = '50%';
    imagesEl.style.webkitPerspectiveOriginY = '50%';

    // listen for resize and orientation changes and make adjustments
    window.addEventListener('resize', () => {
      this.render();
    }, false);

  },

  render: function () {
    let navToggleEl = document.getElementById('navigation_toggle_button_container'),
        xInfoEl = document.getElementById('close_info_container'),
        appInfoEl = document.getElementById('app_info'),
        xExploreEl = document.getElementById('close_explore_container');

    // retrieve dragger size from css
    this.draggerWidth = parseFloat(window.getComputedStyle(document.getElementsByClassName('dragger')[0]).width);
    this.draggerHeight = parseFloat(window.getComputedStyle(document.getElementsByClassName('dragger')[0]).height);

    // retrieve window size; calculate dragger limit box size
    this.mainWide = window.innerWidth;
    this.mainHigh = window.innerHeight;

    this.innerWidth = this.mainWide - this.draggerWidth;
    this.innerHeight = this.mainHigh - this.draggerHeight;

    // set wrapper size; (css vh and vw were not working with mobile safari)
    document.getElementById('wrapper').style.width = this.mainWide + 'px';
    document.getElementById('wrapper').style.height = this.mainHigh + 'px';


    // position the navigation_toggle_button_container on the bottom right
    navToggleEl.style.left = (this.mainWide - parseFloat(window.getComputedStyle(navToggleEl).width) + 'px');
    navToggleEl.style.top = (this.mainHigh - parseFloat(window.getComputedStyle(navToggleEl).height) + 'px');

    // set app_info height
    document.getElementById('app_info').style.height = (this.innerHeight * 0.9) + 'px';

    // set explore_container height
    document.getElementById('explore_container').style.height = (this.innerHeight * 0.9) + 'px';

    // set position and size of the close_info container divs
    xInfoEl.style.width = (parseFloat(window.getComputedStyle(appInfoEl).height) * 0.1) + 'px';
    xInfoEl.style.height = (parseFloat(window.getComputedStyle(appInfoEl).height) * 0.1) + 'px';
    xInfoEl.style.top = (this.mainHigh * 0.05) + (parseFloat(window.getComputedStyle(appInfoEl).height) - parseInt(xInfoEl.style.height)) + 'px';

    // set position and size of the x_icon container divs
    xExploreEl.style.width = (parseFloat(window.getComputedStyle(appInfoEl).height) * 0.1) + 'px';
    xExploreEl.style.height = (parseFloat(window.getComputedStyle(appInfoEl).height) * 0.1) + 'px';
    xExploreEl.style.top = (this.mainHigh * 0.05) + (parseFloat(window.getComputedStyle(appInfoEl).height) - parseInt(xInfoEl.style.height)) + 'px';
  }
};
