export function setDeleteTarget(deleteTarget) {

  return {
    type: 'SET_DELETE_TARGET',
    payload: deleteTarget
  };

}

export function setSelectedImage(id) {
  return {
    type: 'SET_SELECTED_IMAGE',
    payload: id
  };

}

export function resetClickCount() {
  return {
    type: 'RESET_CLICK_COUNT'
  };

}
