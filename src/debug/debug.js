// import helpers from '../helpers';
module.exports = {

  init: function () {
    // helpers.clickme('debug-button', 0);
    // helpers.clickme('dragger_switches_button', 1000);
    // helpers.clickme('explore_button', 0);
    // helpers.clickme('upload_container_button', 1000);

    this.createDebugButton();
    this.createDebugDiv();
    this.setListeners();
  },

  createDebugButton: function () {
    var debugButton = document.getElementById('debug-holder'),
        debugIcon = document.createElement('img'),
        debugText = document.createElement('span');

    // create debug button
    debugButton.setAttribute('id', 'debug-button');
    debugButton.classList.add('button', 'tools_button');
    debugButton.classList.remove('button_no_show');

    debugText.textContent = 'report is off';
    debugText.setAttribute('id', 'debug-text');

    debugIcon.classList.add('icon_image');
    debugIcon.src = '/icons/debug_icon.png';
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
      infoLineEl.classList.add('info');
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

  setListeners: function () {
    var that = this;

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
    Array.from(document.getElementsByClassName('info')).forEach(function (element) {
      element.textContent = '';
    });
  }
};
