
<img src="https://raw.githubusercontent.com/andigan/whatadrag/master/wall-collective.jpg" width="100" />

# wall-collective

blah blah blah

A multi-user responsive real-time web app for sharing, arranging, and transforming images collaboratively on your laptop or phone.

## Features  

Uses:

- Node.js express framework.
- MongoDB for persistent storage of image styles and positions.
- Socket.IO to share style changes with other clients in real time.
- AWS S3 for cloud storage of streamed uploaded images.
- Redux store for state management.
- Webpack for an efficient build.
- Sass for styles.
- Handlebars for templating.
- Babel for ES2015/ES2016 transpiling.
- jQuery.UI for drag and drop.
- Instagram API and OAuth for feed integration.
- Interact.js for touchscreen rotating and resizing.
- HTTP cookies to remember which draggers are activated and session ID.

## Functionality

- Upload images.
- Delete images by dropping them on the exit door.
- Use **_draggers_** to modify:
  - height/width
  - rotation
  - opacity
  - blur/brightness
  - contrast/saturation
  - grayscale/inversion
  - 3D rotation
  - hue-rotation
- Number of currently connected clients indicated by <img src="https://raw.githubusercontent.com/andigan/whatadrag/master/public/icons/person-icon.png" width="8" height="17" /><img src="https://raw.githubusercontent.com/andigan/whatadrag/master/public/icons/person-icon.png" width="8" height="17" /><img src="https://raw.githubusercontent.com/andigan/whatadrag/master/public/icons/person-icon.png" width="8" height="17" /> icons.
- Reset image or page to remove image transformations.
- Share background color changes.
- Optional: On a touchscreen, use pinch gesture to change an image size and angle.

## Installation

1. Install and run MongoDB:

  ```
  $ mongod
  ```
2. Install the npm dependencies:

  ```
  $ npm install
  ```
3. Edit the config.js file.

4. Build and run the app:

  ```
  $ env PORT=8000 npm start
  ```

## Notes

The app is currently in beta mode.
- Instagram integration is currently in sandbox mode due to API restrictions.  Contact me for a working Instagram demo account!
