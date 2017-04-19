export default function(state={element: {}, id: ''}, action) {
  switch (action.type) {
    case "SET_DELETE_TARGET":
      return {...state, element: action.payload, id: action.payload.id}
    default:
      return state
  }
};
