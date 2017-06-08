export default function (state = {id: ''}, action) {
  switch (action.type) {
    case 'SET_SELECTED_IMAGE':
      return {...state, id: action.payload};
    case 'CLEAR_SELECTED_IMAGE':
      return {...state, id: ''};
    default:
      return state;
  }
};
