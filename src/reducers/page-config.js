export default function(state={clickCount: 0, deleteID: ''}, action) {
  switch (action.type) {
    case 'SET_DELETE_ID':
      return {...state, deleteID: action.payload};


      case 'RESET_CLICK_COUNT':
        return {...state, clickCount: 0};
    default:
      return state
  }
};
