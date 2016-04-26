
<img src="https://raw.githubusercontent.com/andigan/whatadrag/master/wall-collective.jpg" width="100" />

# wall-collective

A multi-user responsive real-time web app for sharing, arranging, and transforming images collaboratively on your laptop or phone.

## Features  

- Uses node.js express framework.
- Uses MongoDB for persistent storage of element styles.
- Uses socket.io to share style changes with other clients in real time.
- Uses jQuery sparingly.
- Uses Interact.js for touchscreen rotating and resizing.
- Uses HTTP cookie to remember which draggers are activated.

## Functionality

- Upload images.
- Delete images by dropping them on the exit door.
- Use **_draggers_** to modify:
  - height/width
  - rotation
  - opacity
  - blur/brightness
  - grayscale/inversion
  - contrast/saturation
  - hue-rotation
- Number of currently connected clients indicated by <img src="https://raw.githubusercontent.com/andigan/whatadrag/master/public/icons/person_icon.png" width="8" height="17" /><img src="https://raw.githubusercontent.com/andigan/whatadrag/master/public/icons/person_icon.png" width="8" height="17" /><img src="https://raw.githubusercontent.com/andigan/whatadrag/master/public/icons/person_icon.png" width="8" height="17" /> icons.
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
  config.use_cdn = true;
  config.image_dir = '/images/';
  ```

4. Run the app:

  ```
  $ node app.js
  ```

## Notes

The app is currently in beta mode.
