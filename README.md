
![bookmark image](https://raw.githubusercontent.com/andigan/whatadrag/master/apple-touch-icon.png)

# whatadrag

A real-time app for concurrently sharing, arranging, and transforming images.

## Features  

- Uses node.js express framework.
- Uses MongoDB for persistent storage of element styles.
- Uses socket.io to share style changes with other clients in real time.
- Uses jQuery sparingly.
- Uses Interact.js for touchscreen rotating and resizing.

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
  config.database_name = 'collection_name';

  ```

4. Run the app:

  ```
  $ node app.js
  ```

## Notes

The app is currently in beta mode.

## Current Issues
1. Rethink and redo the z-index system.
Currently, the z-index is mostly manipulated by jquery.draggable stack.  Build a logical z-index tool and share changes after completion.
2. Change posts to sockets.
3. Find and implement a more effective upload system, which will allow and track multiple uploads, and handle cancellations.
4. Modularize.
5. Consider locking the drag access for some draggers, or include this as an option.
6. Performance is severely dependent on file size.  Do client-side resizing before uploading the images.
7. Use a storage service for images.
8. Fix upload dimensions to retain aspect ratio.
9. Include a mode that limits 3D and rotations.
10. Write an initial function to assign data-attributes for angle, scale, rotateX,Y,Z so that those values can be removed from the database.
11. Create new directory when config file directory is changed.
12. Begin work on user accounts and image storage.
13. Manage if multiple clients share a selected file.  Change dragger positions to reflect changes.
14. Remove debug information box completely if debug_on is set to false.
15. Build dragger for transform-origin z value to position elements in z dimension.
16. Build perspective-origin dragger to change focal point.
17. Remove other draggers when dragging one.
