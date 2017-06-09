export default function (state = {status: 'none', imageSelected: false, gridOn: false}, action) {
  switch (action.type) {
    case 'OPEN_NAV':
      return {...state, status: 'initial'};
    case 'CLOSE_NAV':
      return {...state, status: 'none'};
    case 'OPEN_UPLOAD':
      return {...state, status: 'upload'};
    case 'OPEN_SETTINGS':
      return {...state, status: 'settings'};
    case 'OPEN_EDIT':
      return {...state, status: 'edit'};
    case 'OPEN_INFO':
      return {...state, status: 'info'};
    case 'OPEN_IGRAM':
      return {...state, status: 'igram'};
    case 'SET_SELECTED_IMAGE':
      return {...state, imageSelected: true};
    case 'CLEAR_SELECTED_IMAGE':
      return {...state, imageSelected: false};
    case 'TOGGLE_GRID':
      return {...state, gridOn: !state.gridOn};
    default:
      return state;
  }
};
