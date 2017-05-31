import { clickme } from '../helpers';

var options = {
  consoleStore: false,
  consoleZIndexes: true,
  consoleClickTarget: true,
  consoleAllElsUnderClick: false // Chrome only
};

module.exports = {

  init: function () {

    //    clickme('nav-tog-button', 50);
    //    clickme('dragger_switches_button', 1000);
    //    clickme('nav-upload-container_button', 1000);
    clickme('debug-button', 1000);

    this.createDebugButton();
    this.createDebugDiv();
    this.setListeners(options);
  },

  createDebugButton: function () {
    var debugButton = document.getElementById('t5'),
        debugIcon = document.createElement('img'),
        debugText = document.createElement('span');

    // create debug button
    debugButton.setAttribute('id', 'debug-button');
    debugButton.classList.add('button', 'button-tools');
    debugButton.classList.remove('button-no-show');

    debugText.textContent = 'report is off';
    debugText.setAttribute('id', 'debug-text');

    debugIcon.classList.add('nav-button-icon');
    debugIcon.src = '/icons/debug-icon.png';
    debugButton.appendChild(debugText);
    debugButton.appendChild(debugIcon);

    // add button functionality
    debugButton.addEventListener('click', function () {

      if ( this.classList.contains('debug-on') ) {
        this.classList.remove('debug-on');
        document.getElementById('debug-container').style.display = 'none';
        document.getElementById('debug-text').innerText = 'report is off';
      } else {
        this.classList.add('debug-on');
        document.getElementById('debug-container').style.display = 'block';
        document.getElementById('debug-text').innerText = 'report is on';
      };
    });
  },

  createDebugDiv: function () {
    var wrapperEl = document.getElementById('wrapper'),
        debugEl = document.createElement('div'),
        infoLineEl,
        i,
        that = this;

    // create debug div
    debugEl.setAttribute('id', 'debug-container');
    debugEl.style.display = 'none';
    for (i = 1; i <= 10; i++) {
      infoLineEl = document.createElement('div');
      infoLineEl.setAttribute('id', 'info' + i);
      infoLineEl.classList.add('debug-info');
      debugEl.appendChild(infoLineEl);
    };

    wrapperEl.appendChild(debugEl);

    // make debug-container draggable
    $('#debug-container').draggable({
      containment: 'parent',
      start: function () {
        that.clearDebugInfo();
        that.addDebugInfo([
          [1, `this div width    : ${$(this).css('width')}`],
          [2, `wrapper width     : ${document.getElementById('wrapper').style.width}`],
          [3, `screen.width      : ${screen.width.toString()}`],
          [4, `window.innerWidth : ${window.innerWidth.toString()}`],
          [5, `screen.availWidth : ${screen.availWidth.toString()}`]]);
      },
      drag: function () {
        var debugEl = document.getElementById ('debug-container'),
            debugDivInfo = debugEl.getBoundingClientRect();

        that.addDebugInfo([
          [6, ''],
          [7, `${this.style.left} <css> ${$(this).css('right')}`],
          [8, `${debugDivInfo.left.toString()} <dom> ${debugDivInfo.right.toString()}`]]);
      }
    });
  },

  setListeners: function (options) {
    var that = this;

    document.addEventListener('click', function () {
      if (options.consoleStore) {
        console.log(store.getState());
      };

      if (options.consoleZIndexes) {
        console.log(Array.from(document.getElementsByClassName('wallPic')).map(function (el) {
          return el.id + ': z:' + el.style.zIndex;
        }));
      }

      if (options.consoleClickTarget) {
        console.log(event.target.getAttribute('id'));
      };

      if (options.consoleAllElsUnderClick) {
        console.log(document.elementsFromPoint(event.pageX, event.pageY));
      }
    });

    // resize window
    window.addEventListener('resize', function () {
      that.clearDebugInfo();
      that.addDebugInfo([
        [1, `resize: new width  : ${window.innerWidth}px`],
        [2, `resize: new height : ${window.innerHeight}px`]]);});

    // click on image
    document.getElementById('images').addEventListener('click', function (e) {
      var clickedEl = e.target;

      that.clearDebugInfo();
      that.addDebugInfo([
          [1, 'Filename: ' + clickedEl.getAttribute('title')],
          [2, 'Z-index: ' + clickedEl.style.zIndex],
          [3, 'Start: Left: ' + clickedEl.style.left + ' Top: ' + clickedEl.style.top],
          [4, 'Current: '],
          [5, 'Stop: ']]);});

    // dragged images
    $(document).on('dragstart', '.wallPic', function (e) {
      var draggedEl = e.target;

      that.clearDebugInfo();
      that.addDebugInfo([
        [1, `Filename: ${draggedEl.getAttribute('title')}`],
        [2, `Z-index: ${draggedEl.style.zIndex}`],
        [3, `Start: Left: ${draggedEl.style.left} Top: ${draggedEl.style.top}`],
        [4, 'Current: '],
        [5, 'Stop: ']]);
    });

    $(document).on('drag', '.wallPic', function (e) {
      var draggedEl = e.target;

      that.addDebugInfo([
        [4, `Current: Left: ${draggedEl.style.left} Top: ${draggedEl.style.top}`]]);
    });

    $(document).on('dragstop', '.wallPic', function (e) {
      var draggedEl = e.target;

      that.addDebugInfo([
        [5, `Stop: Left: ${draggedEl.style.left} Top: ${draggedEl.style.top}`]]);
    });
  },

  // debugInfoText: a multidimensional array: [[1, string], [2, string]]
  addDebugInfo: function (debugInfoText) {
    debugInfoText.forEach(function (item) {
      document.getElementById('info' + item[0]).textContent = item[1];
    });
  },

  clearDebugInfo: function () {
    Array.from(document.getElementsByClassName('debug-info')).forEach(function (element) {
      element.textContent = '';
    });
  }
};
