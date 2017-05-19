export default function(
  state={
    instaAvailable: false,
    instaFilename: {}
  },
  action) {
  switch (action.type) {
    case 'SET_INSTA_AVAILABLE':
      return {...state, instaAvailable: action.payload};
    case 'SET_INSTA_FILENAME':
      return {...state, instaFilename: action.payload};
    case 'DELETE_INSTA_FILENAME':
      // total immutable violation
      delete state.instaFilename[action.payload];
      return state;
    default:
      return state
  }
};
