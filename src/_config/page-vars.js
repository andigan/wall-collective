module.exports = {

  // values assigned after draggers are created
  dWidth: null,
  dHeight: null,

  // values assigned in page-init during page render
  mainWide: null,
  mainHigh: null,

  imagesWide: null,
  imagesHigh: null,

  dLimits: {
    top: null,
    bottom: null,
    left: null,
    right: null,
    intop: null,
    inbottom: null,
    inleft: null,
    inright: null,
    inwidth: null,
    inheight: null,
    inmiddlex: null,
    inmiddley: null
  },


  setDXY() {
    this.dWidth = parseFloat(window.getComputedStyle(document.getElementsByClassName('dragger')[0]).width);
    this.dHeight = parseFloat(window.getComputedStyle(document.getElementsByClassName('dragger')[0]).height);
  },

  changeMainXY: function (x, y) {
    this.mainWide = x;
    this.mainHigh = y;
  },

  changeImagesXY: function (x, y) {
    this.imagesWide = x;
    this.imagesHigh = y;
  },

  changeDLimits: function (top, bottom, left, right) {
    this.dLimits.top = top;
    this.dLimits.bottom = this.mainHigh - bottom;
    this.dLimits.left = left;
    this.dLimits.right = this.mainWide - right;

    this.dLimits.height = this.dLimits.bottom - this.dLimits.top;
    this.dLimits.width = this.dLimits.right - this.dLimits.left;

    this.dLimits.intop = this.dLimits.top + this.dHeight / 2;
    this.dLimits.inbottom = this.dLimits.bottom - this.dHeight / 2;
    this.dLimits.inleft = this.dLimits.left + this.dWidth / 2;
    this.dLimits.inright = this.dLimits.right - this.dWidth / 2;
    this.dLimits.inwidth = this.dLimits.inright - this.dLimits.inleft;
    this.dLimits.inheight = this.dLimits.inbottom - this.dLimits.intop;
    this.dLimits.inmiddlex = this.dLimits.width / 2 + this.dLimits.left;
    this.dLimits.inmiddley = this.dLimits.height / 2 + this.dLimits.top;
  }

};
