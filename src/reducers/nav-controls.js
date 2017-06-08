export default function (state = {isOpen: false, status: 'none', imageSelected: false}, action) {
  switch (action.type) {
    case 'OPEN_NAV':
      return {...state, isOpen: true, status: 'initial'};
    case 'CLOSE_NAV':
      return {...state, isOpen: false, status: 'none'};
    case 'OPEN_UPLOAD':
      return {...state, isOpen: true, status: 'upload'};
    case 'OPEN_SETTINGS':
      return {...state, isOpen: true, status: 'settings'};
    case 'OPEN_EDIT':
      return {...state, isOpen: true, status: 'edit'};
    case 'SET_SELECTED_IMAGE':
      return {...state, imageSelected: true};
    case 'CLEAR_SELECTED_IMAGE':
      return {...state, imageSelected: false};
    default:
      return state;
  }
};
