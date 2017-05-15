module.exports = {

  hideDraggers() {
    Array.from(document.getElementsByClassName('dragger')).forEach(function (dragger) {
      this.hideElement(dragger);
    }.bind(this));
  },

  hideOtherDraggers(id) {
    Array.from(document.getElementsByClassName('dragger')).forEach(function (dragger) {
      if (dragger.id !== id) {
        this.hideElement(dragger);
      };
    }.bind(this));
  },

  hideID(id) {
    document.getElementById(id).style.display = 'none';
  },

  hideElement(element) {
    element.style.display = 'none';
  },

  showID(id) {
    document.getElementById(id).style.display = 'block';
  },



  deletePreview() {
    var deleteTarget = window.store.getState().deleteTarget;

    // show
    document.getElementById('delete_preview_container').classList.add('delete_preview_container_is_open');
    document.getElementById('delete_preview').src = deleteTarget.element.src;

    // hide
    document.getElementById('navigation_container').classList.remove('navigation_container_is_open');
  },

  openTools() {
    // show
    document.getElementById('tools_container').classList.add('tools_container_is_open');
    // hide
    document.getElementById('navigation_container').classList.remove('navigation_container_is_open');
    document.getElementById('dragger_switches_container').classList.remove('dragger_switches_container_is_open');
  },

  openAccount() {
    // show
    document.getElementById('login_container').classList.add('login_container_is_open');
    // hide
    document.getElementById('navigation_container').classList.remove('navigation_container_is_open');
  },

  openUpload() {
    // show
    document.getElementById('upload_container').classList.add('upload_container_is_open');
    // hide
    document.getElementById('navigation_container').classList.remove('navigation_container_is_open');
  },

  uploadPreview() {
    // hide
    document.getElementById('navigation_container').classList.remove('navigation_container_is_open');
  },

  afterUpload() {
    // show element
    document.getElementById('navigation_container').classList.add('navigation_container_is_open');
    // hide elements
    document.getElementById('upload_container').classList.remove('upload_container_is_open');
    this.hideID('upload_preview_container');
    document.getElementById('upload_preview_container').classList.remove('upload_preview_container_is_open');
    document.getElementById('confirm_or_reject_container_info').textContent = '';
    // This setTimeout is so that the upload_preview_container disappears immediately, and then resets
    // to visible after the transition effect takes place
    setTimeout(function () {
      this.showID('upload_preview_container');
      document.getElementById('confirm_or_reject_container').style.display = 'flex';
    }, 500);
    // replace image_upload_preview image
    document.getElementById('image_upload_preview').src = '/icons/1x1.png';
  },

  afterDelete() {
    // show element
    document.getElementById('navigation_container').classList.add('navigation_container_is_open');
    // hide elements
    document.getElementById('delete_preview_container').style.display = 'none';
    document.getElementById('delete_preview_container').classList.remove('delete_preview_container_is_open');
    this.hideDraggers();
    // This setTimeout is so that the delete_preview_container disappears immediately, and then resets
    // to visible after the transition effect takes place
    setTimeout(function () {
      document.getElementById('delete_preview_container').style.display = 'block';
    }, 500);
    // replace delete_preview
    document.getElementById('delete_preview').src = '/icons/1x1.png';
  },

  rejectDelete() {
    var deleteTarget = window.store.getState().deleteTarget;

    // show element
    document.getElementById('navigation_container').classList.add('navigation_container_is_open');
    // hide elements
    document.getElementById('delete_preview_container').style.display = 'none';
    document.getElementById('delete_preview_container').classList.remove('delete_preview_container_is_open');
    setTimeout(function () {
      document.getElementById('delete_preview_container').style.display = 'block';
    }, 500);
    // reshow hidden image that wasn't deleted
    deleteTarget.element.style.display = 'initial';

    // show image on other clients
    window.socket.emit('ce:  show_image', deleteTarget.id);
  },


  openColorChooser() {

    // //    $("#flat").spectrum("toggle");
    //
    // console.log('clicked');
    //
    //
    //
    //
    //
    //
    // document.getElementById('choice-container').style.display = 'flex';

  },


  closeAll() {
    // hide
    document.getElementById('navigation_container').classList.remove('navigation_container_is_open');
    document.getElementById('upload_preview_container').classList.remove('upload_preview_container_is_open');
    document.getElementById('delete_preview_container').classList.remove('delete_preview_container_is_open');
    document.getElementById('dragger_switches_container').classList.remove('dragger_switches_container_is_open');
    document.getElementById('tools_container').classList.remove('tools_container_is_open');
    document.getElementById('login_container').classList.remove('login_container_is_open');
    document.getElementById('upload_container').classList.remove('upload_container_is_open');
    document.getElementById('connect_info').classList.remove('connect_info_is_open');
    document.getElementById('explore_container').style.display = 'none';
    document.getElementById('insta_header').style.display = 'none';
    document.getElementById('insta_div').style.display = 'none';

    // replace image_upload_preview image and delete_preview image
    document.getElementById('image_upload_preview').src = '/icons/1x1.png';
    document.getElementById('delete_preview').src = '/icons/1x1.png';
    // close navigation button
    document.body.classList.remove('button_container_is_open');
    // animate close hamburgers
    document.getElementById('line_one').style.top = '40%';
    document.getElementById('line_three').style.top = '60%';
  }


};
