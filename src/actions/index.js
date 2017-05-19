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

export function setSessionID(id) {
  return {
    type: 'SET_SESSION_ID',
    payload: id
  };
}

export function setSwitchesStatus(statusStr) {
  return {
    type: 'SET_SWITCHES_STATUS',
    payload: statusStr
  };
}


export function resetClickCount() {
  return {
    type: 'RESET_CLICK_COUNT'
  };
}

export function incrementClickCount() {
  return {
    type: 'INCREMENT_CLICK_COUNT'
  };
}

export function setPreviousClickedIDs(ids) {
  return {
    type: 'SET_CLICKED_IDS',
    payload: ids
  };
}
