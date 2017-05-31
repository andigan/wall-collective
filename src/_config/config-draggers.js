import { setStretchD, setRotationD, setOpacityD, setBlurBrightnessD, setContrastSaturateD, setGrayscaleInvertD, setThreeDD, setPartyD } from '../components/draggers';

module.exports = [
  { name: 'stretch',
    color: 'blue',
    shadowColor: 'blue',
    icon: 'icons/ic_photo_size_select_small_black_24px.svg',
    handler: setStretchD },

  { name: 'opacity',
    color: 'white',
    shadowColor: 'white',
    icon: 'icons/ic_opacity_black_24px.svg',
    handler: setOpacityD },

  { name: 'rotation',
    color: 'green',
    shadowColor: 'green',
    icon: 'icons/ic_rotate_90_degrees_ccw_black_24px.svg',
    handler: setRotationD },

  { name: 'blur_brightness',
    color: 'darkorange',
    shadowColor: 'darkorange',
    icon: 'icons/ic_blur_on_black_24px.svg',
    handler: setBlurBrightnessD },

  { name: 'contrast_saturate',
    color: 'crimson',
    shadowColor: 'crimson',
    icon: 'icons/ic_tonality_black_24px.svg',
    handler: setContrastSaturateD },

  { name: 'grayscale_invert',
    color: 'silver',
    shadowColor: 'silver',
    icon: 'icons/ic_cloud_black_24px.svg',
    handler: setGrayscaleInvertD },

  { name: 'threeD',
    color: 'deeppink',
    shadowColor: 'deeppink',
    icon: 'icons/ic_3d_rotation_black_24px.svg',
    handler: setThreeDD },

  { name: 'party',
    color: 'purple',
    shadowColor: 'purple',
    icon: 'icons/ic_hot_tub_black_24px.svg',
    handler: setPartyD }
];
