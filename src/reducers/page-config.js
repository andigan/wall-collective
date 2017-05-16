export default function(state={clickCount: 0}, action) {
  switch (action.type) {
      case 'RESET_CLICK_COUNT':
        return {...state, clickCount: 0}
    default:
      return state
  }
};
