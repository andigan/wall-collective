export function setDeleteID(id) {

  return {
    type: 'SET_DELETE_ID',
    payload: id
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
