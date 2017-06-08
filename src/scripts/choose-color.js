import config from '../_config/config';
import stateChange from '../scripts/state-change';

export default function () {
  let chooserEl = document.getElementById('color-chooser'),
      chooserPos = config.chooserPos,
      wrapperEl = document.getElementById('wrapper');

  stateChange.hideDraggers();

  chooserEl.style.display = 'block';
  // set the initial location for the color
  chooserEl.jscolor.fromString(wrapperEl.style.backgroundColor);

  // position the input element; the palette box appears above and left-justified
  chooserEl.style.left = `${(parseInt(wrapperEl.style.width) / 2) - (chooserPos.width / 2)}px`;
  chooserEl.style.top = `${(parseInt(wrapperEl.style.height) / 2) + (chooserPos.height / 2)}px`;

  chooserEl.jscolor.show();
};
