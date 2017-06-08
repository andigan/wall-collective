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

export function clearSelectedImage() {
  return {
    type: 'CLEAR_SELECTED_IMAGE'
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

export function openNav() {
  return {
    type: 'OPEN_NAV'
  };
}

export function closeNav() {
  return {
    type: 'CLOSE_NAV'
  };
}

export function openUpload() {
  return {
    type: 'OPEN_UPLOAD'
  };
}

export function openSettings() {
  return {
    type: 'OPEN_SETTINGS'
  };
}

export function openEdit() {
  return {
    type: 'OPEN_EDIT'
  };
}
