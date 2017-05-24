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

  deletePreview(deleteID) {
    // show
    document.getElementById('delete-preview-container').classList.add('delete-preview-container-is-open');
    document.getElementById('image-delete-preview').src = document.getElementById(deleteID).src;

    // hide
    document.getElementById('nav-main-container').classList.remove('nav-is-open');
  },

  openTools() {
    // show
    document.getElementById('nav-tools-container').classList.add('nav-tools-container-is-open');
    // hide
    document.getElementById('nav-main-container').classList.remove('nav-is-open');
    document.getElementById('d-switches-container').classList.remove('d-switches-is-open');
  },

  openAccount() {
    // show
    document.getElementById('nav-account-container').classList.add('nav-account-container-is-open');
    // hide
    document.getElementById('nav-main-container').classList.remove('nav-is-open');
  },

  openInfo() {
    // show
    document.getElementById('info-page').style.display = 'block';
    // hide
    document.getElementById('nav-account-container').classList.remove('nav-account-container-is-open');

  },

  openUpload() {
    // show
    document.getElementById('nav-upload-container').classList.add('upload-container-is-open');
    // hide
    document.getElementById('nav-main-container').classList.remove('nav-is-open');
  },

  uploadPreview() {
    // hide
    document.getElementById('nav-upload-container').classList.remove('upload-container-is-open');
  },

  afterUpload() {
    // show element
    document.getElementById('nav-main-container').classList.add('nav-is-open');
    // hide elements
    document.getElementById('nav-upload-container').classList.remove('upload-container-is-open');
    this.hideID('upload-preview-container');
    document.getElementById('upload-preview-container').classList.remove('upload-preview-container_is_open');

    // This setTimeout is so that the upload-preview-container disappears immediately, and then resets
    // to visible after the transition effect takes place
    setTimeout(() => {
      this.showID('upload-preview-container');
      document.getElementById('upload-confirm-info').textContent = '';
      document.getElementById('upload-confirm-container').style.display = 'flex';
    }, 500);
    // replace image-upload-preview image
    document.getElementById('image-upload-preview').src = '/icons/1x1.png';
  },

  afterDelete() {
    let delPreviewEL = document.getElementById('delete-preview-container');

    // show element
    document.getElementById('nav-main-container').classList.add('nav-is-open');
    // hide elements
    this.hideElement(delPreviewEL);
    delPreviewEL.classList.remove('delete-preview-container-is-open');
    this.hideDraggers();
    // This setTimeout is so that the delete-preview-container disappears immediately, and then resets
    // to visible after the transition effect takes place
    setTimeout(function () {
      document.getElementById('delete-preview-container').style.display = 'block';
    }, 500);
    // replace image-delete-preview
    document.getElementById('image-delete-preview').src = '/icons/1x1.png';
  },

  rejectDelete() {
    let deleteID = window.store.getState().pageConfig.deleteID,
        delPreviewEL = document.getElementById('delete-preview-container');

    // show element
    document.getElementById('nav-main-container').classList.add('nav-is-open');
    // hide elements
    this.hideElement(delPreviewEL);
    delPreviewEL.classList.remove('delete-preview-container-is-open');
    setTimeout(function () {
      document.getElementById('delete-preview-container').style.display = 'block';
    }, 500);
    // reshow hidden image that wasn't deleted
//    debugger
    document.getElementById(deleteID).style.display = 'block';

    // show image on other clients
    window.socket.emit('ce:_showImage', deleteID);
  },

  closeAll() {



    // hide
    document.getElementById('nav-main-container').classList.remove('nav-is-open');
    document.getElementById('upload-preview-container').classList.remove('upload-preview-container_is_open');
    document.getElementById('delete-preview-container').classList.remove('delete-preview-container-is-open');
    document.getElementById('d-switches-container').classList.remove('d-switches-is-open');
    document.getElementById('nav-tools-container').classList.remove('nav-tools-container-is-open');
    document.getElementById('nav-account-container').classList.remove('nav-account-container-is-open');
    document.getElementById('info-page').style.display = 'none';
    document.getElementById('nav-upload-container').classList.remove('upload-container-is-open');
    document.getElementById('connect-info').classList.remove('connect-info-is-open');
    document.getElementById('explore-container').style.display = 'none';
    document.getElementById('insta-header').style.display = 'none';
    document.getElementById('insta-container').style.display = 'none';

    // replace image-upload-preview image and image-delete-preview image
    document.getElementById('image-upload-preview').src = '/icons/1x1.png';
    document.getElementById('image-delete-preview').src = '/icons/1x1.png';
    // close navigation button
    document.body.classList.remove('a-nav-container-is-open');
    // animate close hamburgers
    document.getElementById('ham-line1').style.top = '40%';
    document.getElementById('ham-line3').style.top = '60%';
  }
};
