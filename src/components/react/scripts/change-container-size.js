import config from '../../../_config/config';

export default function (buttonsNum) {
  document.getElementById('nav-container').style.width = buttonsNum * config.navBSize + 'px';
};
