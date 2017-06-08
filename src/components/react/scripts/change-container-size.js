import config from '../../../_config/config';

export default function (buttonsNum) {
  document.getElementById('here-nav-container').style.width = buttonsNum * config.navBSize + 'px';
};
