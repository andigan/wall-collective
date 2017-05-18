import { setDraggerLocations } from './draggers';
import { setSwitchesStatus } from '../actions';
import { setCookie } from '../helpers';

export function dSwitchsInit() {

  Array.from(document.getElementsByClassName('dragger-switch')).forEach(function (switchEl) {

    switchEl.onclick = function () {
      let draggerEl = document.getElementById(this.getAttribute('id').replace('switch-', 'dragger-')),
          dLetter = draggerEl.id[8],
          // convert switchesStatuses to an array ["S", "r", "O"...]; scope to function
          switchesStats = window.store.getState().pageConfig.switchesStatus.split(''),
          switchStr;

      // toggle switch.switchon
      this.classList.toggle('switchon');

      if (this.classList.contains('switchon')) {
        // set dragger locations
        setDraggerLocations(window.store.getState().selectedImage.id);

        // show dragger if an image is selected
        if (window.store.getState().selectedImage.id !== '') {
          draggerEl.style.display = 'block';
        };

        // use d-letter to find corresponding character in the array
        // and replace it with uppercase character to indicate switch is on
        switchesStats[switchesStats.indexOf(dLetter)] = dLetter.toUpperCase();
      } else {

        // hide dragger
        draggerEl.style.display = 'none';
        // use d-letter to find corresponding character in the array
        // and replace it with lowercase character to indicate switch is off
        switchesStats[switchesStats.indexOf(dLetter.toUpperCase())] = dLetter.toLowerCase();
      };

      switchStr = switchesStats.join('');

      setCookie('switches_status', switchStr, 7);
      window.store.dispatch(setSwitchesStatus(switchStr));

    };
  });

  // dragger-switch-all; used to toggle all dragger switches
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

    // set dragger element locations
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
