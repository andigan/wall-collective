module.exports = {
  init: function () {

    this.render();

    // add perspective to 3d transforms
    let imagesDiv = document.getElementById('images');

    imagesDiv.style.width = window.innerWidth + 'px';
    imagesDiv.style.height = window.innerHeight + 'px';
    imagesDiv.style.webkitPerspective = '500px';
    imagesDiv.style.webkitPerspectiveOriginX = '50%';
    imagesDiv.style.webkitPerspectiveOriginY = '50%';

    // listen for resize and orientation changes and make adjustments
    window.addEventListener('resize', () => {
      this.render();
    }, false);

  },

  render: function () {
    let navToggleDiv = document.getElementById('navigation_toggle_button_container'),
        closeInfoDiv = document.getElementById('close_info_container'),
        appInfoDiv = document.getElementById('app_info'),
        closeExploreDiv = document.getElementById('close_explore_container');

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
    navToggleDiv.style.left = (this.mainWide - parseFloat(window.getComputedStyle(navToggleDiv).width) + 'px');
    navToggleDiv.style.top = (this.mainHigh - parseFloat(window.getComputedStyle(navToggleDiv).height) + 'px');

    // set app_info height
    document.getElementById('app_info').style.height = (this.innerHeight * 0.9) + 'px';

    // set explore_container height
    document.getElementById('explore_container').style.height = (this.innerHeight * 0.9) + 'px';

    // set position and size of the close_info container divs
    closeInfoDiv.style.width = (parseFloat(window.getComputedStyle(appInfoDiv).height) * 0.1) + 'px';
    closeInfoDiv.style.height = (parseFloat(window.getComputedStyle(appInfoDiv).height) * 0.1) + 'px';
    closeInfoDiv.style.top = (this.mainHigh * 0.05) + (parseFloat(window.getComputedStyle(appInfoDiv).height) - parseInt(closeInfoDiv.style.height)) + 'px';

    // set position and size of the x_icon container divs
    closeExploreDiv.style.width = (parseFloat(window.getComputedStyle(appInfoDiv).height) * 0.1) + 'px';
    closeExploreDiv.style.height = (parseFloat(window.getComputedStyle(appInfoDiv).height) * 0.1) + 'px';
    closeExploreDiv.style.top = (this.mainHigh * 0.05) + (parseFloat(window.getComputedStyle(appInfoDiv).height) - parseInt(closeInfoDiv.style.height)) + 'px';
  }
};
