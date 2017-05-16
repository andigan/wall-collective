module.exports = {

  init(pageSettings) {
    this.page = pageSettings;
    this.wrapperEl = document.getElementById('wrapper');
  },

  vline(left, color, id) {
    let lineEl = document.createElement('div');

    if (id) lineEl.setAttribute('id', id);
    lineEl.classList.add('vline');
    lineEl.style.backgroundColor = color;
    lineEl.style.left = left;

    this.wrapperEl.appendChild(lineEl);
  },

  hline(top, color, id) {
    let lineEl = document.createElement('div');

    if (id) lineEl.setAttribute('id', id);
    lineEl.classList.add('hline');
    lineEl.style.backgroundColor = color;
    lineEl.style.top = top;

    this.wrapperEl.appendChild(lineEl);
  },

  make_grid() {
    let infoEl = document.createElement('div');

    infoEl.setAttribute('id', 'd-info');
    infoEl.style.left = `${((this.page.draggerWidth / 2) + 1)}px`;
    infoEl.style.height = `${(this.page.draggerHeight / 2)}px`;
    infoEl.style.width = `${(this.page.mainWide - this.page.draggerWidth - 2)}px`;

    this.wrapperEl.appendChild(infoEl);

    this.vline(`${(this.page.mainWide - (this.page.draggerWidth / 2))}px`, 'red', 'grid-right');
    this.vline(`${(this.page.draggerWidth / 2)}px`, 'blue'  , 'grid-left');
    this.hline(`${(this.page.mainHigh - (this.page.draggerHeight / 2))}px`, 'purple', 'grid-bottom');
    this.hline(`${(this.page.draggerHeight / 2)}px`, 'yellow', 'grid-top');
  },

  remove_grid() {
    document.getElementById('grid-top').remove();
    document.getElementById('grid-bottom').remove();
    document.getElementById('grid-left').remove();
    document.getElementById('grid-right').remove();
    document.getElementById('d-info').remove();
  }
};
