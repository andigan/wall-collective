import config from '../_config/config';
import pageSettings from '../_init/page-settings';

export function initializeImage(imageEl) {

  imageEl.setAttribute('data-scale', '1');
  imageEl.setAttribute('data-angle', '0');
  imageEl.setAttribute('data-rotateX', '0');
  imageEl.setAttribute('data-rotateY', '0');
  imageEl.setAttribute('data-rotateZ', '0');
  imageEl.setAttribute('data-persective', '0');
  imageEl.style.width = config.uploadWidth;
  imageEl.style.height = config.uploadHeight;
  imageEl.style.top = config.uploadTop;
  imageEl.style.left = config.uploadLeft;
  imageEl.style.opacity = 1;
  imageEl.style.WebkitFilter = 'grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)';
  imageEl.style.transform = 'rotate(0deg) scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg)';
};

export function convertDimToPercent(imageEl) {
  if (!imageEl.style.height.includes('%')) {
    imageEl.style.width = ((parseInt(window.getComputedStyle(imageEl).width) / pageSettings.imagesWide * 100).toFixed(2)) + '%';
    imageEl.style.height = ((parseInt(window.getComputedStyle(imageEl).height) / pageSettings.imagesHigh * 100).toFixed(2)) + '%';
  };
}

export function highestZ() {
  let imageEls = document.getElementsByClassName('wallPic');

  // reduce method to return the highest
  return Array.from(imageEls).reduce(function (highest, imageEl) {
    let z = parseInt(imageEl.style.zIndex);

    return z > highest ? z : highest;
  }, 0);

}

export function shiftZsAboveXDown(imageEl) {
  let imageEls = document.getElementsByClassName('wallPic'),
      x = imageEl.style.zIndex;

  Array.from(imageEls).forEach(function (imageEl) {
    if (imageEl.style.zIndex > x) {
      imageEl.style.zIndex = imageEl.style.zIndex - 1;
    };
  });
}
