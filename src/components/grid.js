import pageVars from '../_config/page-vars.js';

module.exports = {

  vline(left, color, id) {
    let lineEl = document.createElement('div'),
        wrapperEl = document.getElementById('wrapper');

    if (id) lineEl.setAttribute('id', id);
    lineEl.classList.add('grid-vline');
    lineEl.style.left = left;
    lineEl.style.top = pageVars.dLimits.intop + 'px';
    lineEl.style.height = pageVars.dLimits.inheight + 'px';
    lineEl.style.backgroundColor = color;

    wrapperEl.appendChild(lineEl);
  },

  hline(top, color, id) {
    let lineEl = document.createElement('div'),
        wrapperEl = document.getElementById('wrapper');

    if (id) lineEl.setAttribute('id', id);
    lineEl.classList.add('grid-hline');
    lineEl.style.top = top;
    lineEl.style.left = pageVars.dLimits.inleft + 'px';
    lineEl.style.width = pageVars.dLimits.inwidth + 'px';
    lineEl.style.backgroundColor = color;

    wrapperEl.appendChild(lineEl);
  },

  make_grid() {
    let infoEl = document.createElement('div'),
        wrapperEl = document.getElementById('wrapper');

    infoEl.setAttribute('id', 'grid-info');
    infoEl.style.left = `${((pageVars.draggerWidth / 2) + 1)}px`;
    infoEl.style.height = `${(pageVars.draggerHeight / 2)}px`;
    infoEl.style.width = `${(pageVars.mainWide - pageVars.draggerWidth - 2)}px`;

    wrapperEl.appendChild(infoEl);

    if (store.getState().navBar.gridOn) {
      this.vline(`${pageVars.dLimits.inleft}px`, 'red', 'grid-right');
      this.vline(`${pageVars.dLimits.inright}px`, 'blue'  , 'grid-left');
      this.hline(`${pageVars.dLimits.intop}px`, 'purple', 'grid-bottom');
      this.hline(`${pageVars.dLimits.inbottom}px`, 'yellow', 'grid-top');
    };
  },

  remove_grid() {
    if (store.getState().navBar.gridOn) {
      document.getElementById('grid-top').remove();
      document.getElementById('grid-bottom').remove();
      document.getElementById('grid-left').remove();
      document.getElementById('grid-right').remove();
    };
    document.getElementById('grid-info').remove();
  }
};
