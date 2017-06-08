  import pageVars from '../../_config/page-vars';
  import stateChange from '../../scripts/state-change';
  import { setSelectedImage } from '../../actions';
  import { resetClickCount } from '../../actions';
  import { incrementClickCount } from '../../actions';
  import { setPreviousClickedIDs } from '../../actions';
  import { setDraggerLocations } from '../draggers';
  import { convertDimToPercent } from '../images';
  import { highestZ } from '../images';
  import { shiftZsAboveXDown } from '../images';
  import { zReport } from '../images';

  // use this function to assign draggable to all '.wallPic' elements
  // and then specific elements by passing an id
  export function assignImageDrag(id) {

    if (typeof id === 'undefined') {
      id = '.wallPic';
    } else {
      id = '#' + id;
    };

    // draggable method from jquery.ui
    $(id).draggable(
      {
        // containment: 'window',
        // stack: '.wallPic', // the stack option automatically adjusts z-indexes for all .wallPic elements
        scroll: true,
        start:  function (event, ui) {
          // convert percentage to original pixel size
          let left = parseInt(this.style.left) / 100 * pageVars.imagesWide,
              top = parseInt(this.style.top) / 100 * pageVars.imagesHigh,
              topZ = highestZ();

          // recoup for transformed objects, to keep the drag event centered on a transformed object.
          this.recoupLeft = left - ui.position.left;
          this.recoupTop = top - ui.position.top;

          this.imageID = this.getAttribute('id');

          // change zIndexes
          if (parseInt(this.style.zIndex) < topZ) {
            shiftZsAboveXDown(this.style.zIndex);
            this.style.zIndex = topZ;
            window.socket.emit('ce:_changeZs', zReport());
          };

          stateChange.hideDraggers();

          // remove filter
          // --this is necessary because dragging images with filter causes too much rendering lag
          this.setAttribute('data-filter', this.style.webkitFilter);
          this.style.webkitFilter = '';

          // send emit to remove filter from other clients
          window.socket.emit('ce:_removeFilter', this.imageID);

          // pass id to ce:_lockID
          window.socket.emit('ce:_lockID', this.imageID);

          // begin to prepare socketdata
          this.socketdata = {};
          this.socketdata.imageID = this.imageID;

          // set selectedImage
          store.dispatch(setSelectedImage(this.getAttribute('id')));
        },
        drag: function (event, ui) {
          // recoup drag position
          ui.position.left += this.recoupLeft;
          ui.position.top += this.recoupTop;

          // prepare socketdata to pass
          this.socketdata.posTop = (ui.position.top / pageVars.imagesHigh * 100).toFixed(2);
          this.socketdata.posLeft = (ui.position.left / pageVars.imagesWide * 100).toFixed(2);

          // pass socket data to server
          window.socket.emit('ce:_moving', this.socketdata);
        },
        stop: function () {
          // prepare data to send to ajax post, get all wallPic elements
          let dropPost = {},
              imageEls = document.body.getElementsByClassName('wallPic');

          // return to the original z-index
//          this.style.zIndex = this.originalZindex;

          // restore filter
          this.style.webkitFilter = this.getAttribute('data-filter');
          this.removeAttribute('data-filter');

          // send emit to restore filter to other clients
          window.socket.emit('ce:_restoreFilter', this.imageID);

          // send emit to unfreeze in other clients
          window.socket.emit('ce:_unlockID', this.imageID);

          // prepare data to send to server
          dropPost.filename = this.getAttribute('title');
          dropPost.left = this.socketdata.posLeft + '%';
          dropPost.top = this.socketdata.posTop + '%';

          // change width and height back to percentage
          // (in safari, draggable width is percentage; in chrome, width is px)
          convertDimToPercent(document.getElementById(this.imageID));

          // and left, right
          document.getElementById(this.imageID).style.left = this.socketdata.posLeft + '%';
          document.getElementById(this.imageID).style.top = this.socketdata.posTop + '%';

          // populate dropPost
          dropPost.imageEls = Array.from(imageEls).map(function (imageEl) {
            return { domId: imageEl.getAttribute('id'), zIndex: imageEl.style.zIndex };
          });

          // ajax post from jquery.  FUTURE WORK: replace with a socket
          $.ajax({
            method: 'POST',
            url: '/dragstop',
            data: JSON.stringify( { dropPost: dropPost} ),
            contentType: 'application/json'
          }).done(function () {
          });

          // reset click count
          window.store.dispatch(resetClickCount());
        }
      });

    $(id).click(function (event) {
      var i,
          imageEls = document.getElementsByClassName('wallPic'),
          clickedElsIdsandZIndexes;


       clickedElsIdsandZIndexes = Array.from(imageEls).filter(function (imageEl) {
        let imagePxRange = {},
            offsetLeft,
            offsetTop;

            // calculate the range of pixels it occupies on the page...
            offsetLeft = imageEl.getBoundingClientRect().left + document.body.scrollLeft;
            offsetTop = imageEl.getBoundingClientRect().top + document.body.scrollTop;
            imagePxRange = { xRange: { left: offsetLeft, right: offsetLeft + imageEl.offsetWidth },
                             yRange: { top: offsetTop, bottom: offsetTop + imageEl.offsetHeight } };

       // if the event click is within the image's range
       return (event.pageX >= imagePxRange.xRange.left && event.pageX <= imagePxRange.xRange.right) && (event.pageY >= imagePxRange.yRange.top && event.pageY <= imagePxRange.yRange.bottom);

     }).map(function(clickedEl) {
       return [ clickedEl.id, clickedEl.style.zIndex ];
     });

      // sort the array by z-index, highest to lowest.
      clickedElsIdsandZIndexes.sort(function (a, b) {
        return b[1] - a[1];
      });

      if (clickedElsIdsandZIndexes.length === 0) {
        clickedElsIdsandZIndexes = [this.id, this.style.zIndex];
      };

      // if selected_file is not empty, remove animation-selected-image class
      if ( store.getState().selectedImage.id !== '') {
        document.getElementById(store.getState().selectedImage.id).classList.remove('animation-selected-image');
        // css-trick: this will 'trigger a reflow' which will allow the class to be added again before the animation ends.
        document.getElementById(store.getState().selectedImage.id).offsetWidth;
      };

      // if one image is clicked...
      if (clickedElsIdsandZIndexes.length === 1) {

        // set the selected_file
        store.dispatch(setSelectedImage(this.id));

        // add the animation-selected-image class
        this.classList.add('animation-selected-image');

        // reset click count
        window.store.dispatch(resetClickCount());

      // else when more than one image is clicked...
      } else {
        let clickedIDs = '',
            // fetch the previous_clickedIDs
            previous_clickedIDs = window.store.getState().pageConfig.clickedIDs;

        // create a string of clicked ids ".2.3"
        for (i = 0; i < clickedElsIdsandZIndexes.length; i++) {
          clickedIDs = clickedIDs + '.' + clickedElsIdsandZIndexes[i][0];
          // remove animation-temp-fade from all clicked images
          document.getElementById(clickedElsIdsandZIndexes[i][0]).classList.remove('animation-temp-fade');
          document.getElementById(clickedElsIdsandZIndexes[i][0]).offsetWidth;
        };

        // if the clickedIDs have changed, reset the click_count to 0
        if ((clickedIDs !== previous_clickedIDs) || (previous_clickedIDs === '')) {
          window.store.dispatch(resetClickCount());
        };

        // add a click
        window.store.dispatch(incrementClickCount());

        // set the selected image to an id in the clicked array
        // using the remainder of the clickCount divided by the number of clicked images
        // to cycle through clicks
        // BUG
        window.store.dispatch(setSelectedImage( clickedElsIdsandZIndexes[(window.store.getState().pageConfig.clickCount - 1) % clickedElsIdsandZIndexes.length][0]));



        // add border animation
        document.getElementById(window.store.getState().selectedImage.id).classList.add('animation-selected-image');

        // add animation-temp-fade class to all clicked images other than the one selected
        for (i = 0; i < clickedElsIdsandZIndexes.length; i++) {

          // don't add animation-temp-fade class to selected file
          // or to an image already faded
          // or if the selected_file is already on top
          if ((clickedElsIdsandZIndexes[i][0] !== store.getState().selectedImage.id) && (document.getElementById(clickedElsIdsandZIndexes[i][0]).style.opacity > 0.50)
             && ( (window.store.getState().pageConfig.clickCount % clickedElsIdsandZIndexes.length) !== 1 )) {
            document.getElementById(clickedElsIdsandZIndexes[i][0]).classList.add('animation-temp-fade');
          };
        };

        // store previous clicked ids string
        window.store.dispatch(setPreviousClickedIDs(clickedIDs));
      };

      setDraggerLocations(store.getState().selectedImage.id);
    });
  }
