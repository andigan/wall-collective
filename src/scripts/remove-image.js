import { setDeleteID } from '../actions';
import stateChange from '../scripts/state-change';

export default function () {

  if (window.store.getState().selectedImage.id !== '') {
    let deleteID = window.store.getState().selectedImage.id;

    window.store.dispatch(setDeleteID(deleteID));

    stateChange.hideID(deleteID);
    stateChange.hideDraggers();

    // show delete preview container
    document.getElementById('delete-preview-container').classList.add('delete-preview-container-is-open');
    document.getElementById('delete-image-preview').src = document.getElementById(deleteID).src;

    window.socket.emit('ce:_hideImage', deleteID);
  }

};
