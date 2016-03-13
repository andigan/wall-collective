
![bookmark image](https://raw.githubusercontent.com/andigan/whatadrag/master/apple-touch-icon.png)

# whatadrag

A real-time app for sharing, arranging, and transforming images.

## Features  

- Uses node.js express framework.
- Uses MongoDB for persistent storage of element styles.
- Uses socket.io to share style changes with other clients in real time.

## Functionality

- Upload images.
- Delete images by dropping them on the toolbox.
- Use **_draggers_** to modify:
  - size
  - rotation
  - opacity
  - blur/brightness
  - grayscale/inversion
  - contrast/saturation
  - hue-rotation
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
  config.publicimagedir = 'public/art';
  config.database_name = 'mydatabase';
  config.use_cdn = true;
  ```

4. Run the app:

  ```
  $ node app.js
  ```

## Notes

The app is currently in beta mode.
