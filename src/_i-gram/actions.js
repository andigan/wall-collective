export function setInstaAvailable(bool) {
  return {
    type: 'SET_INSTA_AVAILABLE',
    payload: bool
  };
}

export function setInstaFilename(filenameObj) {
  return {
    type: 'SET_INSTA_FILENAME',
    payload: filenameObj
  };
}

export function deleteInstaFilename(filenameKey) {
  return {
    type: 'DELETE_INSTA_FILENAME',
    payload: filenameKey
  };
}
