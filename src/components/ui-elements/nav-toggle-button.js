import config from '../../_config/config';
import pageSettings from '../../_init/pageSettings';

module.exports = {

  init() {
    $('#nav-toggle-button-container').draggable({
      cancel: true,
      containment: 'parent',
      scroll: false,
      start: function () {

        // used to prevent click from registering
        document.getElementById('nav-tog-button').classList.add('nav-tog-dragging');

        this.commitDistanceMax = 5;

        // get the starting size
        this.high = $(this).height();
        this.wide = $(this).width();

        // get values of top and left for bottom and right placements
        this.topWhenOnBottom = (pageSettings.mainHigh - this.high);
        this.leftWhenOnRight = (pageSettings.mainWide - this.wide);
      },
      drag: function (event, ui) {
        // ui.position.top is wherever the drag cursor goes

        this.currentTop = parseInt(this.style.top);
        this.currentLeft = parseInt(this.style.left);

        // take y axis measurements
        if (this.currentTop === 0) {
//          console.log('Top or Bottom: Top');
          this.yLocation = 'top';
          this.mostRecentYLocation = 'top';
        } else if (this.currentTop === this.topWhenOnBottom) {
          // console.log('Top or Bottom: Bottom');
          this.yLocation = 'bottom';
          this.mostRecentYLocation = 'bottom';
        } else {
          // console.log('Top or Bottom: Between');
          this.yLocation = 'between';
        };

        // take x axis measurements
        if (this.currentLeft === 0) {
          // console.log('Left or Right: Left');
          this.xLocation = 'left';
          this.mostRecentXLocation = 'left';
        } else if (this.currentLeft === this.leftWhenOnRight) {
          // console.log('Left or Right: Right');
          this.xLocation = 'right';
          this.mostRecentXLocation = 'right';
        } else {
          // console.log('Left or Right: Between');
          this.xLocation = 'between';
        };

        // console.log('Corner: Not a corner.');

        // if the element is on a side already, keep it there
        if ((this.yLocation === 'top') && (this.xLocation === 'between') ) {
          ui.position.top = 0;
        } else if ((this.yLocation === 'bottom') && (this.xLocation === 'between') ) {
          ui.position.top = this.topWhenOnBottom;
        } else if ((this.xLocation === 'left') && (this.yLocation === 'between') ) {
          ui.position.left = 0;
        } else if ((this.xLocation === 'right') && (this.yLocation === 'between') ) {
          ui.position.left = this.leftWhenOnRight;
        // else when the element is in a corner
        // usually the next drag ui will lock the element to a side
        // but on the occasion that the ui.position goes uniformly toward the center (e.g. 0,0 to 1,1)
        // select the side based on which directional threshold the ui crosses first
        } else {
          // console.log(`Corner: ${this.mostRecentXLocation} ${this.mostRecentYLocation}`);
          // top left corner: left drag
          if ( (this.mostRecentXLocation === 'left') && (this.mostRecentYLocation === 'top') && (ui.position.left > this.commitDistanceMax) ) {
            ui.position.top = 0;
          };
          // top left corner: down drag
          if ( (this.mostRecentXLocation === 'left') && (this.mostRecentYLocation === 'top') && (ui.position.top > this.commitDistanceMax) ) {
            ui.position.left = 0;
          };
          // top right corner: right drag
          if ( (this.mostRecentXLocation === 'right') && (this.mostRecentYLocation === 'top') && (this.leftWhenOnRight - ui.position.left > this.commitDistanceMax) ) {
            ui.position.top = 0;
          };
          // top right corner: down drag
          if ( (this.mostRecentXLocation === 'right') && (this.mostRecentYLocation === 'top') && (ui.position.top > this.commitDistanceMax) ) {
            ui.position.left = this.leftWhenOnRight;
          };
          // bottom left corner: left drag
          if ( (this.mostRecentXLocation === 'left') && (this.mostRecentYLocation === 'bottom') && (ui.position.left > this.commitDistanceMax ) ) {
            ui.position.top = this.topWhenOnBottom;
          };
          // bottom left corner: up drag
          if ( (this.mostRecentXLocation === 'left') && (this.mostRecentYLocation === 'bottom') && (this.topWhenOnBottom - ui.position.top > this.commitDistanceMax) ) {
            ui.position.left = 0;
          };
          // bottom right corner: right drag
          if ( (this.mostRecentXLocation === 'right') && (this.mostRecentYLocation === 'bottom') && (this.leftWhenOnRight - ui.position.left > this.commitDistanceMax) ) {
            ui.position.top = this.topWhenOnBottom;
          };
          // bottom right corner: up drag
          if ( (this.mostRecentXLocation === 'right') && (this.mostRecentYLocation === 'bottom') && (this.topWhenOnBottom - ui.position.top > this.commitDistanceMax) ) {
            ui.position.left = this.leftWhenOnRight;
          };
        };
      },
      stop: function () {
        // allow click
        setTimeout( function () {
          document.getElementById('nav-tog-button').classList.remove('nav-tog-dragging');
        }, 200);
      }
    });

  }
};
