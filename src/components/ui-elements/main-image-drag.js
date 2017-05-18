  import pageSettings from '../../_init/pageSettings';
  import stateChange from '../../views/state-change';
  import { setSelectedImage } from '../../actions';
  import { resetClickCount } from '../../actions';
  import { incrementClickCount } from '../../actions';
  import { setPreviousClickedIDs } from '../../actions';
  import { setDraggerLocations } from '../draggers';

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
        stack: '.wallPic', // the stack option automatically adjusts z-indexes for all .wallPic elements
        scroll: true,
        start:  function (event, ui) {
          // convert percentage to original pixel size
          let left = parseInt(this.style.left) / 100 * pageSettings.imagesWide,
              top = parseInt(this.style.top) / 100 * pageSettings.imagesHigh;

          // recoup for transformed objects, to keep the drag event centered on a transformed object.
          this.recoupLeft = left - ui.position.left;
          this.recoupTop = top - ui.position.top;

          // store the original z index
          this.originalZindex = this.style.zIndex;

          // store image id
          this.imageID = this.getAttribute('id');

          // assign temporary z-index
          this.style.zIndex = 60000;

          stateChange.hideDraggers();

          // remove filter
          // --this is necessary because dragging images with filter causes too much rendering lag
          this.setAttribute('data-filter', this.style.webkitFilter);
          this.style.webkitFilter = '';

          // send emit to remove filter from other clients
          socket.emit('ce:_removeFilter', this.imageID);

          // pass id to ce:_lockID
          socket.emit('ce:_lockID', this.imageID);

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
          this.socketdata.posTop = (ui.position.top / pageSettings.imagesHigh * 100).toFixed(2);
          this.socketdata.posLeft = (ui.position.left / pageSettings.imagesWide * 100).toFixed(2);

          // pass socket data to server
          socket.emit('ce:_moving', this.socketdata);
        },
        stop: function () {
          // prepare data to send to ajax post, get all wallPic elements
          let dropPost = {},
              i,
              imageEls = document.body.getElementsByClassName('wallPic');

          // return to the original z-index
          this.style.zIndex = this.originalZindex;

          // restore filter
          this.style.webkitFilter = this.getAttribute('data-filter');
          this.removeAttribute('data-filter');

          // send emit to restore filter to other clients
          socket.emit('ce:_restoreFilter', this.imageID);

          // send emit to unfreeze in other clients
          socket.emit('ce:_unlockID', this.imageID);

          // prepare data to send to server
          dropPost.domIDs = [];
          dropPost.filenames = [];
          dropPost.zIndexes = [];
          dropPost.dFilename = this.getAttribute('title');
          dropPost.posLeft = this.socketdata.posLeft + '%';
          dropPost.posTop = this.socketdata.posTop + '%';

          // change width and height back to percentage
          // (in safari, draggable width is percentage; in chrome, width is px)
          if (this.style.width.includes('px')) {
            document.getElementById(this.imageID).style.width = (parseFloat(this.style.width) / pageSettings.imagesWide * 100).toFixed(2) + '%';
            document.getElementById(this.imageID).style.height = (parseFloat(this.style.height) / pageSettings.imagesHigh * 100).toFixed(2) + '%';
          }
          // and left, right
          document.getElementById(this.imageID).style.left = this.socketdata.posLeft + '%';
          document.getElementById(this.imageID).style.top = this.socketdata.posTop + '%';

          // populate dropPost
          for (i = 0; i < imageEls.length; i++) {
            dropPost.domIDs[i] = imageEls[i].getAttribute('id');
            dropPost.filenames[i] = imageEls[i].getAttribute('title');
            dropPost.zIndexes[i] = imageEls[i].style.zIndex;
          };

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


    $(id).click(function() {
      var i,
          imageEls = document.getElementsByClassName('wallPic'),
          clickedElsIdsandZIndexes = [];

      // for each .wallPic on the page...
      for (i = 0; i < imageEls.length; i ++) {
        let imagePxRange = {},
            offsetLeft,
            offsetTop;

        // calculate the range of pixels it occupies on the page...
        offsetLeft = imageEls[i].getBoundingClientRect().left + document.body.scrollLeft;
        offsetTop = imageEls[i].getBoundingClientRect().top + document.body.scrollTop;
        imagePxRange = { xRange: [ offsetLeft, offsetLeft + imageEls[i].offsetWidth ],
                         yRange: [ offsetTop, offsetTop + imageEls[i].offsetHeight] };

        // if the event click is within the image's range
        if ( (event.pageX >= imagePxRange.xRange[0] && event.pageX <= imagePxRange.xRange[1]) && (event.pageY >= imagePxRange.yRange[0] && event.pageY <= imagePxRange.yRange[1]) ) {
          // add the .wallPic id and z-index to an array.
          clickedElsIdsandZIndexes.push([ imageEls[i].id, imageEls[i].style.zIndex ]);
        };
      };

      // sort the array by z-index, highest to lowest.
      clickedElsIdsandZIndexes.sort(function (a, b) {
        return b[1] - a[1];
      });

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
