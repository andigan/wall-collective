
<img src="https://raw.githubusercontent.com/andigan/whatadrag/master/wall-collective.jpg" width="100" />

# wall-collective

A multi-user responsive real-time web app for sharing, arranging, and transforming images collaboratively on your laptop or phone.

## Features  

Uses:

- Node.js express framework.
- MongoDB for persistent storage of element styles.
- Socket.IO to share style changes with other clients in real time.
- jQuery sparingly.
- Interact.js for touchscreen rotating and resizing.
- HTTP cookies to remember which draggers are activated.

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
- Reset page to remove image transformations.
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

  Example:

  ```
  config.port = '80';
  config.database_name = 'mydatabase';
  config.useCDN = true;
  config.imageDir = '/images/';
  ```

4. Run the app:

  ```
  $ node app.js
  ```

## Notes

The app is currently in beta mode.
- Instagram integration is currently in sandbox mode due to API restrictions.  Contact me for a working Instagram demo account!
- Currently only works consistently with Chrome and Safari.
