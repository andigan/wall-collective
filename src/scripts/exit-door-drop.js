import stateChange from '../scripts/state-change';
import { setDeleteID } from '../actions';

export default function () {

  $('#exit-drop').droppable({
    accept: '.wallPic',
    // activeClass: 'exit_active_class',
    hoverClass: 'exit-drop-hover',
    tolerance: 'pointer',

    over: function () { /* console.log('over exit door'); */ },
    out: function () { /* console.log('back out over exit door '); */ },
    drop: function (event, ui) {
      let deleteID = ui.draggable[0].id;

      window.store.dispatch(setDeleteID(deleteID));

      stateChange.hideID(deleteID);
      stateChange.hideDraggers();

      // show delete preview container
      document.getElementById('delete-preview-container').classList.add('delete-preview-container-is-open');
      document.getElementById('delete-image-preview').src = document.getElementById(deleteID).src;

      window.socket.emit('ce:_hideImage', deleteID);
    }
  });
}
