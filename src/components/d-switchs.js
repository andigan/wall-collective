import { setDraggerLocations } from './draggers';
import { setSwitchesStatus } from '../actions';
import { getCookie } from '../helpers';
import { setCookie } from '../helpers';

export function dSwitchsInit() {
  getSetSwitchStatus();
  switchFunction();
  switchAllFunction();
}

function getSetSwitchStatus() {
  let statusStr = getCookie('switches_status'),
      switches = ['stretch', 'rotation', 'opacity', 'blur_brightness', 'contrast_saturate', 'grayscale_invert', 'threeD', 'party'];

    if (statusStr === '') {
      statusStr = 'SRObcgtp';
      setCookie('switches_status', statusStr, 7);
    };

  window.store.dispatch(setSwitchesStatus(statusStr));

  // if the statusStr character is uppercase, turn on the corresponding switch
  statusStr.split('').forEach(function (switchLetter, index) {
    if (switchLetter === switchLetter.toUpperCase()) {
      document.getElementById('switch-' + switches[index]).classList.add('switchon');
    };
  });
}

function switchFunction() {

  // for each switchEl
  Array.from(document.getElementsByClassName('dragger-switch')).forEach(function (switchEl) {

    switchEl.onclick = function () {
      let draggerEl = document.getElementById(this.getAttribute('id').replace('switch-', 'dragger-')),
          dLetter = draggerEl.id[8],
          // convert switchesStatuses to an array ["S", "r", "O"...]; scope to function
          switchesStats = window.store.getState().pageConfig.switchesStatus.split(''),
          switchStr;

      this.classList.toggle('switchon');

      if (this.classList.contains('switchon')) {

        setDraggerLocations(window.store.getState().selectedImage.id);

        // if an image is selected, show dragger
        if (window.store.getState().selectedImage.id !== '') {
          draggerEl.style.display = 'block';
        };

        // use d-letter to find corresponding character in the array
        // and replace it with uppercase character to indicate switch is on
        switchesStats[switchesStats.indexOf(dLetter)] = dLetter.toUpperCase();
      } else {
        draggerEl.style.display = 'none';
        // replace corresponding letter with lowercase character to indicate switch is off
        switchesStats[switchesStats.indexOf(dLetter.toUpperCase())] = dLetter.toLowerCase();
      };

      switchStr = switchesStats.join('');

      setCookie('switches_status', switchStr, 7);
      window.store.dispatch(setSwitchesStatus(switchStr));
    };
  });
}

function switchAllFunction() {
  // dragger-switch-all functionality
  document.getElementById('dragger-switch-all').onclick = function () {
    let switchEls = document.getElementsByClassName('dragger-switch'),
        draggerEls = document.getElementsByClassName('dragger'),
        isOn,
        switchStr;

    // add or remove 'switchon' class in dragger-switch-all
    this.classList.toggle('switchon');

    isOn = document.getElementById('dragger-switch-all').classList.contains('switchon');

    Array.from(switchEls).forEach(function (switchEl) {
      isOn ? switchEl.classList.add('switchon') : switchEl.classList.remove('switchon');
    });

    setDraggerLocations(window.store.getState().selectedImage.id);

    // show dragger elements if an image is selected
    if (window.store.getState().selectedImage.id) {

      Array.from(draggerEls).forEach(function (draggerEl) {
        draggerEl.style.display = isOn ? 'block' : 'none';
      });
    };

    switchStr = isOn ? 'SROBCGTP' : 'srobcgtp';

    // set cookie to all uppercase
    setCookie('switches_status', switchStr, 7);
    window.store.dispatch(setSwitchesStatus(switchStr));
  };
}
