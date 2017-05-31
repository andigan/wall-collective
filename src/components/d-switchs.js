import config from '../_config/config';
import { setDraggerLocations } from './draggers';
import { setSwitchesStatus } from '../actions';
import { getCookie } from '../helpers';
import { setCookie } from '../helpers';


function createSwitches() {
  let wrapperEl = document.getElementById('wrapper'),
      switchesEl = document.createElement('div');

  switchesEl.id = 'switches';





  wrapperEl.appendChild(switchesEl);

  let switches =
    [{ name: 'stretch', color: 'blue',  icon: 'icons/ic_photo_size_select_small_black_24px.svg' },
    { name: 'rotation', color: 'green',  icon: 'icons/ic_rotate_90_degrees_ccw_black_24px.svg' },
    { name: 'opacity', color: 'white',  icon: 'icons/ic_opacity_black_24px.svg'},
    { name: 'blur_brightness', color: 'darkorange',  icon: 'icons/ic_blur_on_black_24px.svg'},
    { name: 'contrast_saturate', color: 'crimson',  icon: 'icons/ic_tonality_black_24px.svg'},
    { name: 'grayscale_invert', color: 'silver',  icon: 'icons/ic_cloud_black_24px.svg'},
    { name: 'threeD', color: 'deeppink',  icon: 'icons/ic_3d_rotation_black_24px.svg'},
    { name: 'party', color: 'purple', icon: 'icons/ic_hot_tub_black_24px.svg'}]
  ;

  switches.forEach(function (aswitch) {
    let switchContainerEl = document.createElement('div'),
        iconContainerEl = document.createElement('div'),
        iconEl = document.createElement('img');


    switchContainerEl.id = 'switch-' + aswitch.name;
    switchContainerEl.classList.add('switch-container');
    switchContainerEl.classList.add('dragger-switch');

    iconContainerEl.classList.add('d-icon-container');
    iconContainerEl.style.backgroundColor = aswitch.color;

    iconEl.classList.add('d-icon');

    iconEl.src = aswitch.icon;



    iconContainerEl.appendChild(iconEl);

    switchContainerEl.appendChild(iconContainerEl);

    switchesEl.appendChild(switchContainerEl);



  });






}









export function dSwitchsInit() {
  createSwitches();
  getSetSwitchStatus();
  switchFunction();
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
          draggerEl.classList.add('draggeron');
        };

        // use d-letter to find corresponding character in the array
        // and replace it with uppercase character to indicate switch is on
        switchesStats[switchesStats.indexOf(dLetter)] = dLetter.toUpperCase();
      } else {
//        draggerEl.style.display = 'none';
        draggerEl.classList.remove('draggeron');
        // replace corresponding letter with lowercase character to indicate switch is off
        switchesStats[switchesStats.indexOf(dLetter.toUpperCase())] = dLetter.toLowerCase();
      };

      switchStr = switchesStats.join('');

      setCookie('switches_status', switchStr, 7);
      window.store.dispatch(setSwitchesStatus(switchStr));
    };
  });
}
