

function createCube() {
  let imagesEl = document.getElementById('images'),
      cubeEl = document.createElement('div');

  cubeEl.id = 'cube';

  // create 6 faces
  for (let i = 1; i < 7; i++) {
    let faceEl = document.createElement('div'),
        faceConEl = document.createElement('div'),
        textAreaEl = document.createElement('input');

    faceEl.classList.add('face', `face${i}`);

    faceConEl.classList.add('face-content');
    faceConEl.textContent = `side ${i}`;

    textAreaEl.setAttribute('type', 'text');
    textAreaEl.classList.add('textbox-input');

    faceEl.appendChild(textAreaEl);
    faceEl.appendChild(faceConEl);

    cubeEl.appendChild(faceEl);
  };

  imagesEl.appendChild(cubeEl);
}


function keyboardListener() {
  let xAngle = 0,
      yAngle = 0;

  document.addEventListener('keydown', function (e) {

    switch(e.keyCode) {

      case 37: // left
        yAngle -= 90;
        break;

      case 38: // up
        xAngle += 90;
        break;

      case 39: // right
        yAngle += 90;
        break;

      case 40: // down
        xAngle -= 90;
        break;

      default:
        break;
    };

    document.getElementById('cube').style.webkitTransform = `rotateX(${xAngle}deg) rotateY(${yAngle}deg)`;
  }, false);
}


function swipeListener() {

  let xAngle = 0,
      yAngle = 0,
      xDown = null,
      yDown = null;

  document.addEventListener('touchstart', handleTouchStart, false);
  document.addEventListener('touchmove', handleTouchMove, false);

  function handleTouchStart(evt) {
    xDown = evt.touches[0].clientX;
    yDown = evt.touches[0].clientY;
  };

  function handleTouchMove(evt) {
    if ( ! xDown || ! yDown ) {
      return;
    }

    let xUp = evt.touches[0].clientX,
        yUp = evt.touches[0].clientY,
        xDiff = xDown - xUp,
        yDiff = yDown - yUp;

    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {
      if ( xDiff > 0 ) {
        /* left swipe */
        yAngle -= 90;
        document.getElementById('cube').style.webkitTransform = `rotateX(${xAngle}deg) rotateY(${yAngle}deg)`;
      } else {
        /* right swipe */
        yAngle += 90;
        document.getElementById('cube').style.webkitTransform = `rotateX(${xAngle}deg) rotateY(${yAngle}deg)`;
      };
    } else {
      if ( yDiff > 0 ) {
        /* up swipe */
        xAngle += 90;
        document.getElementById('cube').style.webkitTransform = `rotateX(${xAngle}deg) rotateY(${yAngle}deg)`;
      } else {
        /* down swipe */
        xAngle -= 90;
        document.getElementById('cube').style.webkitTransform = `rotateX(${xAngle}deg) rotateY(${yAngle}deg)`;
      };
    }
    /* reset values */
    xDown = null;
    yDown = null;
  };










}





export function textboxInit() {

  createCube();

  // assign oninput change all inputs and faces
  Array.from(document.getElementsByClassName('textbox-input')).forEach(function (inputEl) {

    inputEl.oninput = function (e) {

      Array.from(document.getElementsByClassName('face-content')).forEach(function (el) {
        el.textContent = e.target.value;
      });
      Array.from(document.getElementsByClassName('textbox-input')).forEach(function (el) {
        el.value = e.target.value;
      });
    };

  });

  keyboardListener();
  swipeListener();

}
