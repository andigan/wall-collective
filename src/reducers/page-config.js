export default function(
  state={
    clickCount: 0,
    deleteID: '',
    sessionID: '',
    clickedIDs: '',
    instaAvailable: false },
  action) {
  switch (action.type) {
    case 'SET_DELETE_ID':
      return {...state, deleteID: action.payload};
    case 'SET_SESSION_ID':
      return {...state, sessionID: action.payload};
    case 'RESET_CLICK_COUNT':
      return {...state, clickCount: 0};
    case 'INCREMENT_CLICK_COUNT':
      return {...state, clickCount: state.clickCount + 1};
    case 'SET_CLICKED_IDS':
      return {...state, clickedIDs: action.payload};
    // IGRAM-OPTION
    case 'SET_INSTA_AVAILABLE':
      return {...state, instaAvailable: action.payload};
    default:
      return state
  }
};
