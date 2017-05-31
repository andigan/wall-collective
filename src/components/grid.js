import pageSettings from '../_init/page-settings.js';

module.exports = {

  vline(left, color, id) {
    let lineEl = document.createElement('div'),
        wrapperEl = document.getElementById('wrapper');

    if (id) lineEl.setAttribute('id', id);
    lineEl.classList.add('grid-vline');
    lineEl.style.left = left;
    lineEl.style.top = pageSettings.dLimits.intop + 'px';
    lineEl.style.height = pageSettings.dLimits.inheight + 'px';
    lineEl.style.backgroundColor = color;

    wrapperEl.appendChild(lineEl);
  },

  hline(top, color, id) {
    let lineEl = document.createElement('div'),
        wrapperEl = document.getElementById('wrapper');

    if (id) lineEl.setAttribute('id', id);
    lineEl.classList.add('grid-hline');
    lineEl.style.top = top;
    lineEl.style.left = pageSettings.dLimits.inleft + 'px';
    lineEl.style.width = pageSettings.dLimits.inwidth + 'px';
    lineEl.style.backgroundColor = color;

    wrapperEl.appendChild(lineEl);
  },

  make_grid() {
    let infoEl = document.createElement('div'),
        wrapperEl = document.getElementById('wrapper');

    infoEl.setAttribute('id', 'grid-info');
    infoEl.style.left = `${((pageSettings.draggerWidth / 2) + 1)}px`;
    infoEl.style.height = `${(pageSettings.draggerHeight / 2)}px`;
    infoEl.style.width = `${(pageSettings.mainWide - pageSettings.draggerWidth - 2)}px`;

    wrapperEl.appendChild(infoEl);

    this.vline(`${pageSettings.dLimits.inleft}px`, 'red', 'grid-right');
    this.vline(`${pageSettings.dLimits.inright}px`, 'blue'  , 'grid-left');
    this.hline(`${pageSettings.dLimits.intop}px`, 'purple', 'grid-bottom');
    this.hline(`${pageSettings.dLimits.inbottom}px`, 'yellow', 'grid-top');
  },

  remove_grid() {
    document.getElementById('grid-top').remove();
    document.getElementById('grid-bottom').remove();
    document.getElementById('grid-left').remove();
    document.getElementById('grid-right').remove();
    document.getElementById('grid-info').remove();
  }
};
