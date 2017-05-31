import config from '../_config/config';
import dData from '../_config/config-draggers';
import { setDraggerLocations } from './draggers';
import { setSwitchesStatus } from '../actions';
import { getCookie } from '../helpers';
import { setCookie } from '../helpers';

export function dSwitchsInit() {
  createSwitches();
  getSetSwitchStatus();
  switchFunction();
}

function createSwitches() {
  let wrapperEl = document.getElementById('wrapper'),
      switchesEl = document.createElement('div');

  switchesEl.id = 'switches-container';

  wrapperEl.appendChild(switchesEl);

  dData.forEach(function (aswitch) {
    let switchContainerEl = document.createElement('div'),
        iconContainerEl = document.createElement('div'),
        iconEl = document.createElement('img');


    switchContainerEl.id = 'switch-' + aswitch.name;
    switchContainerEl.classList.add('switch-container');
    switchContainerEl.classList.add('dragger-switch');

    iconContainerEl.classList.add('switch-icon-container');
    iconContainerEl.style.backgroundColor = aswitch.color;

    iconEl.src = aswitch.icon;
    iconEl.classList.add('d-icon');

    iconContainerEl.appendChild(iconEl);

    switchContainerEl.appendChild(iconContainerEl);

    switchesEl.appendChild(switchContainerEl);
  });
}

function getSetSwitchStatus() {
  let statusStr = getCookie('switches_status'),
      switches = ['stretch', 'rotation', 'opacity', 'blur_brightness', 'contrast_saturate', 'grayscale_invert', 'threeD', 'party'];

  if (statusStr === '') {
    statusStr = config.initialDraggers;
    setCookie('switches_status', statusStr, 7);
  };

  window.store.dispatch(setSwitchesStatus(statusStr));

  // if the statusStr character is uppercase, turn on the corresponding switch
  statusStr.split('').forEach(function (switchLetter, index) {
    if (switchLetter === switchLetter.toUpperCase()) {
      document.getElementById('switch-' + switches[index]).classList.add('switchon');
      document.getElementById('switch-' + switches[index]).firstChild.classList.add('switchon');
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
      this.firstChild.classList.toggle('switchon');

      if (this.classList.contains('switchon')) {

        setDraggerLocations(window.store.getState().selectedImage.id);

        // if an image is selected, show dragger
        if (window.store.getState().selectedImage.id !== '') {
//          draggerEl.style.display = 'block';
          draggerEl.classList.add('d-on');
        };

        // use d-letter to find corresponding character in the array
        // and replace it with uppercase character to indicate switch is on
        switchesStats[switchesStats.indexOf(dLetter)] = dLetter.toUpperCase();
      } else {
//        draggerEl.style.display = 'none';
        draggerEl.classList.remove('d-on');
        // replace corresponding letter with lowercase character to indicate switch is off
        switchesStats[switchesStats.indexOf(dLetter.toUpperCase())] = dLetter.toLowerCase();
      };

      switchStr = switchesStats.join('');

      setCookie('switches_status', switchStr, 7);
      window.store.dispatch(setSwitchesStatus(switchStr));
    };
  });
}
