import { closeNav } from '../actions';

module.exports = {

  hideDraggers() {
    Array.from(document.getElementsByClassName('dragger')).forEach(function (dragger) {
      dragger.classList.remove('d-on');
    }.bind(this));
  },

  hideOtherDraggers(id) {
    Array.from(document.getElementsByClassName('dragger')).forEach(function (dragger) {
      if (dragger.id !== id) {
        dragger.classList.remove('d-on');
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


  afterUpload() {
    store.dispatch(closeNav());

    // hide elements
    this.hideID('upload-preview-container');
    document.getElementById('upload-preview-container').classList.remove('upload-preview-container_is_open');

    // This setTimeout is so that the upload-preview-container disappears immediately, and then resets
    // to visible after the transition effect takes place
    setTimeout(() => {
      this.showID('upload-preview-container');
      document.getElementById('upload-confirm-info').textContent = '';
      document.getElementById('upload-confirm-container').style.display = 'flex';
    }, 500);
    // replace upload-image-preview image
    document.getElementById('upload-image-preview').src = '/icons/1x1.png';
  },

  afterDelete() {
    let delPreviewEL = document.getElementById('delete-preview-container');

    // hide elements
    this.hideElement(delPreviewEL);
    delPreviewEL.classList.remove('delete-preview-container-is-open');
    this.hideDraggers();
    // This setTimeout is so that the delete-preview-container disappears immediately, and then resets
    // to visible after the transition effect takes place
    setTimeout(function () {
      document.getElementById('delete-preview-container').style.display = 'block';
    }, 500);
    // replace delete-image-preview
    document.getElementById('delete-image-preview').src = '/icons/1x1.png';
  },

  rejectDelete() {
    let deleteID = window.store.getState().pageConfig.deleteID,
        delPreviewEL = document.getElementById('delete-preview-container');

    // hide elements
    this.hideElement(delPreviewEL);
    delPreviewEL.classList.remove('delete-preview-container-is-open');
    setTimeout(function () {
      document.getElementById('delete-preview-container').style.display = 'block';
    }, 500);
    // reshow hidden image that wasn't deleted
    document.getElementById(deleteID).style.display = 'block';

    // show image on other clients
    window.socket.emit('ce:_showImage', deleteID);
  }

};
