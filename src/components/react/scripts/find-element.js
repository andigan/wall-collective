export default function (actionName) {
  return Array.from(document.getElementsByClassName('nav-button')).filter(function (button) {
    return (button.getAttribute('data-action') === actionName);
  } )[0];
};
