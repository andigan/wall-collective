import pageVars from '../../_config/page-vars';
import { openNav, closeNav } from '../../actions';

module.exports = {

  navToggleInit() {

    // handle click
    document.getElementById('nav-tog-button').onclick = () => {
      let navMainEl = document.getElementById('nav-tog-button');

      // if the main button is not being dragged, process the click.
      if ( navMainEl.classList.contains('nav-tog-dragging') === false ) {

        // if any containers are open
        if ( store.getState().navBar.status !== 'none' ) {

          // close all containers
          store.dispatch(closeNav());

          // hide elements
          document.getElementById('switches-container').classList.remove('switches-container-open');
          document.getElementById('upload-preview-container').classList.remove('upload-preview-container_is_open');
          document.getElementById('delete-preview-container').classList.remove('delete-preview-container-is-open');
          document.getElementById('connect-info').classList.remove('connect-info-is-open');

          document.getElementById('app-info').style.display = 'none';
          document.getElementById('igram-header').style.display = 'none';
          document.getElementById('igram-container').style.display = 'none';

          // replace upload-image-preview image and delete-image-preview image
          document.getElementById('upload-image-preview').src = '/icons/1x1.png';
          document.getElementById('delete-image-preview').src = '/icons/1x1.png';

          // animate close hamburgers
          document.getElementById('ham-line1').style.top = '40%';
          document.getElementById('ham-line3').style.top = '60%';

          // if an image is selected
          if ( store.getState().selectedImage.id !== '' ) {
            // restore selected image in case it was removed by being dragged onto the exit door
            document.getElementById(store.getState().selectedImage.id).style.display = 'initial';
          };
        // else when no containers are open
        } else {
          store.dispatch(openNav());
          document.getElementById('connect-info').classList.add('connect-info-is-open');

          // animate open hamburgers
          document.getElementById('ham-line1').style.top = '35%';
          document.getElementById('ham-line3').style.top = '65%';
        };
      };
    };

    // make toggle button container draggable
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
        this.topWhenOnBottom = (pageVars.mainHigh - this.high);
        this.leftWhenOnRight = (pageVars.mainWide - this.wide);
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
