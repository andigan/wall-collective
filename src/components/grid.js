import pageSettings from '../_init/pageSettings.js';

module.exports = {

  vline(left, color, id) {
    let lineEl = document.createElement('div'),
        wrapperEl = document.getElementById('wrapper');

    if (id) lineEl.setAttribute('id', id);
    lineEl.classList.add('vline');
    lineEl.style.backgroundColor = color;
    lineEl.style.left = left;

    wrapperEl.appendChild(lineEl);
  },

  hline(top, color, id) {
    let lineEl = document.createElement('div'),
        wrapperEl = document.getElementById('wrapper');

    if (id) lineEl.setAttribute('id', id);
    lineEl.classList.add('hline');
    lineEl.style.backgroundColor = color;
    lineEl.style.top = top;

    wrapperEl.appendChild(lineEl);
  },

  make_grid() {
    let infoEl = document.createElement('div'),
        wrapperEl = document.getElementById('wrapper');

    infoEl.setAttribute('id', 'd-info');
    infoEl.style.left = `${((pageSettings.draggerWidth / 2) + 1)}px`;
    infoEl.style.height = `${(pageSettings.draggerHeight / 2)}px`;
    infoEl.style.width = `${(pageSettings.mainWide - pageSettings.draggerWidth - 2)}px`;

    wrapperEl.appendChild(infoEl);

    this.vline(`${(pageSettings.mainWide - (pageSettings.draggerWidth / 2))}px`, 'red', 'grid-right');
    this.vline(`${(pageSettings.draggerWidth / 2)}px`, 'blue'  , 'grid-left');
    this.hline(`${(pageSettings.mainHigh - (pageSettings.draggerHeight / 2))}px`, 'purple', 'grid-bottom');
    this.hline(`${(pageSettings.draggerHeight / 2)}px`, 'yellow', 'grid-top');
  },

  remove_grid() {
    document.getElementById('grid-top').remove();
    document.getElementById('grid-bottom').remove();
    document.getElementById('grid-left').remove();
    document.getElementById('grid-right').remove();
    document.getElementById('d-info').remove();
  }
};
