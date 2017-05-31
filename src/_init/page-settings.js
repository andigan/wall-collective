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
    let navToggleEl = document.getElementById('nav-toggle-button-container'),
        imagesEl = document.getElementById('images'),
        wrapperEl = document.getElementById('wrapper'),
        aspectFit = {};

    // retrieve dragger size from css
    this.draggerWidth = parseFloat(window.getComputedStyle(document.getElementsByClassName('dragger')[0]).width);
    this.draggerHeight = parseFloat(window.getComputedStyle(document.getElementsByClassName('dragger')[0]).height);

    // retrieve window size; calculate dragger limit box size
    this.mainWide = window.innerWidth;
    this.mainHigh = window.innerHeight;

    // set dragger limits
    this.dLimits = {
      top: 50,
      bottom: this.mainHigh - 200,
      left: 50,
      right: this.mainWide - 50
    };

    this.dLimits.height = this.dLimits.bottom - this.dLimits.top;
    this.dLimits.width = this.dLimits.right - this.dLimits.left;

    this.dLimits.intop = this.dLimits.top + this.draggerHeight / 2;
    this.dLimits.inbottom = this.dLimits.bottom - this.draggerHeight / 2;
    this.dLimits.inleft = this.dLimits.left + this.draggerWidth / 2;
    this.dLimits.inright = this.dLimits.right - this.draggerHeight / 2;
    this.dLimits.inwidth = this.dLimits.inright - this.dLimits.inleft;
    this.dLimits.inheight = this.dLimits.inbottom - this.dLimits.intop;
    this.dLimits.inmiddlex = this.dLimits.width / 2 + this.dLimits.left;
    this.dLimits.inmiddley = this.dLimits.height / 2 + this.dLimits.top;

    // set wrapper size; (css vh and vw were not working with mobile safari)
    wrapperEl.style.width = this.mainWide + 'px';
    wrapperEl.style.height = this.mainHigh + 'px';

    // set images container size; maintain portrait aspect ratio
    aspectFit = this.calculateAspectRatioFit(320, 460, this.mainWide, this.mainHigh);

    this.imagesHigh = aspectFit.height;
    this.imagesWide = aspectFit.width;
    imagesEl.style.height = this.imagesHigh + 'px';
    imagesEl.style.width = this.imagesWide + 'px';

    // center images div vertically
    imagesEl.style.top = ((this.mainHigh - this.imagesHigh) / 2) + 'px';

    // position the nav-toggle-button-container on the bottom right
    navToggleEl.style.left = (this.mainWide - parseFloat(window.getComputedStyle(navToggleEl).width) + 'px');
    navToggleEl.style.top = (this.mainHigh - parseFloat(window.getComputedStyle(navToggleEl).height) + 'px');

    // add perspective to 3d transforms
    imagesEl.style.webkitPerspective = '500px';
    imagesEl.style.webkitPerspectiveOriginX = '50%';
    imagesEl.style.webkitPerspectiveOriginY = '50%';
  }
};
