export function setDeleteTarget(deleteTarget) {

  return {
    type: 'SET_DELETE_TARGET',
    payload: deleteTarget
  };

}

export function setSelectedImage(id) {
  console.log('fired');
  console.log(id);

  return {
    type: "SET_SELECTED_IMAGE",
    payload: id
  };

}
