# whatadrag

A real-time app for sharing, manipulating, and arranging images.

## Features  

- Uses node.js express framework.
- Uses MongoDB for persistent storage of element styles.
- Uses socket.io to share style changes with other clients in real time.

### Installation

1. Install and run MongoDB:
```
$ mongod
```
2. Install the npm dependencies:
```
$ npm install
```
3. Edit the config.js file.

  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Example:
```
config.port = '80';
config.publicimagedir = 'public/art';
config.slashimagedirslash = '/art/';
config.database_name = 'mydatabase';
```

4. Run the app:
```
$ node app.js
