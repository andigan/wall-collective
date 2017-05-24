export default function(
  state={
    hasIGramToken: false,
    instaFilename: {}
  },
  action) {
  switch (action.type) {
    case 'SET_HAS_TOKEN':
      return {...state, hasIGramToken: action.payload};
    default:
      return state
  }
};
