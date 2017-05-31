export default function (
  state = {
    clickCount: 0,
    deleteID: '',
    sessionID: '',
    switchesStatus: '',
    clickedIDs: ''
  },
  action) {
  switch (action.type) {
    case 'SET_DELETE_ID':
      return {...state, deleteID: action.payload};
    case 'SET_SESSION_ID':
      return {...state, sessionID: action.payload};
    case 'SET_SWITCHES_STATUS':
      return {...state, switchesStatus: action.payload};
    case 'RESET_CLICK_COUNT':
      return {...state, clickCount: 0};
    case 'INCREMENT_CLICK_COUNT':
      return {...state, clickCount: state.clickCount + 1};
    case 'SET_CLICKED_IDS':
      return {...state, clickedIDs: action.payload};
    default:
      return state;
  }
};
