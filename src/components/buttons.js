import stateChange from '../scripts/state-change';
import { setDeleteID } from '../actions';
import { clearSelectedImage } from '../actions';

export function buttonsInit() {

  addEvents([
    document.getElementById('button-reject-delete'),
    document.getElementById('button-confirm-delete'),
    document.getElementById('button-reject-upload')
  ]);
}

function addEvents(buttons) {
  buttons.forEach(
    button => { button.addEventListener('click', onClick.bind(this)); });
}

function onClick(e) {
  switch (e.currentTarget.getAttribute('data-action')) {

    case 'delete-reject':
      stateChange.rejectDelete();
      window.socket.emit('ce:_showImage', window.store.getState().pageConfig.deleteID);
      break;

    case 'delete-confirm':
      let socketdata = {},
          deleteID = window.store.getState().pageConfig.deleteID;

      // prepare socket data
      socketdata.filenameToDelete = document.getElementById(deleteID).getAttribute('title');
      socketdata.deleteID = deleteID;

      // remove element
      document.getElementById(deleteID).remove();

      stateChange.afterDelete();

      // reset store
      store.dispatch(clearSelectedImage());
      store.dispatch(setDeleteID(''));

      // send data to server to delete image
      socket.emit('ce:_deleteImage', socketdata);
      break;

    case 'upload-reject':
      stateChange.afterUpload();
      break;


    // experimental
    case 'textbox':
      let x = document.getElementById('cube');

      if (x.style.display === 'none') {
        x.style.display = 'block';
      } else {
        x.style.display = 'none';
      };
      break;


    case 'open-explore':
      document.getElementById('explore-container').style.display = 'block';

      document.getElementById('image-explore').src = document.getElementById(store.getState().selectedImage.id).src;

      if (document.getElementById(store.getState().selectedImage.id).getAttribute('data-link').length > 1) {

        document.getElementById('igram-link').setAttribute('href', document.getElementById(store.getState().selectedImage.id).getAttribute('data-link'));
      };


      if ( (typeof store.getState().selectedImage.id !== 'undefined') && (store.getState().selectedImage.id.length > 0 ) ) {

        // if selected file is empty, fill it.

      } else {
      };
      break;
    default:
      break;
  }
}
