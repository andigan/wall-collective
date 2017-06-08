export default function (actionName) {
  return Array.from(document.getElementsByClassName('here-nav-button')).filter(function (button) {
    return (button.getAttribute('data-action') === actionName);
  } )[0];
};
