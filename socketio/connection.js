var config = require('../config/config'),
    randomstring = require('randomstring'),
    ImageCon = require('../db/controllers/image-controller'),
    connectedClients = [], // an array of current sessionIDs that are connected
    localAdapter = require('../adapters/local'),
    s3Adapter = require('../adapters/s3');

module.exports = function (io) {

  // an instance of this function and its variables are created for each client connected
  io.on('connection', function (socket) {
    var sessionID = '';

    // check to see if the client is new or revisiting with a cookie
    socket.on('ce:_sendSessionID', function (clientVars) {
      sessionID = clientVars.sessionID;

      if (config.useIGram) {
        require('../i-gram/igram-io.js')(socket, sessionID);
      };

      // add backgroundColor
      clientVars.backgroundColor = config.backgroundColor;

      // if the client is revisiting, send original sessionID to client
      if (sessionID !== '' && sessionID !== 'null' && sessionID !== '[object Object]') {
        console.log('>>>' + sessionID + ' reconnected.');
        socket.emit('connect:_setClientVars', clientVars);

      // else when client is new, generate a new sessionID
      } else {
        sessionID = randomstring.generate(config.sessionStr);
        console.log('>>>>>>' + sessionID + ' connected for first time.');
        clientVars.sessionID = sessionID;
        socket.emit('connect:_setClientVars', clientVars);
      };

      // add sessionID to connectedClients array
      connectedClients.push(sessionID);

      // change user count on all clients
      io.sockets.emit('bc:_changeConnectedClients', connectedClients);
    });

    // on disconnect
    socket.on('disconnect', function () {
      console.log('<<<' + sessionID + ' disconnected...');
      // remove sessionID from connectedClients array
      connectedClients.splice(connectedClients.indexOf(sessionID), 1);
      // change user count on remaining clients
      socket.broadcast.emit('bc:_changeConnectedClients', connectedClients);
    });

    // sockets to share image transformations
    socket.on('ce:_moving', function (data) {
      socket.broadcast.emit('bc:_moving', data);
    });

    socket.on('ce:_resizing', function (data) {
      socket.broadcast.emit('bc:_resizing', data);
    });

    socket.on('ce:_saveResize', function (data) {
      ImageCon.saveResize(data);
      socket.broadcast.emit('bc:_resized', data);
    });

    socket.on('ce:_saveDataAttributes', function (data) {
      ImageCon.saveAttributes(data);
      socket.broadcast.emit('bc:_changeDataAttributes', data);
    });

    socket.on('ce:_transforming', function (data) {
      socket.broadcast.emit('bc:_transforming', data);
    });

    socket.on('ce:_saveTransform', function (data) {
      ImageCon.saveTransform(data);
    });

    socket.on('ce:_opacityChanging', function (data) {
      socket.broadcast.emit('bc:_opacityChanging', data);
    });

    socket.on('ce:_saveOpacity', function (data) {
      ImageCon.saveOpacity(data);
    });

    socket.on('ce:_filterChanging', function (data) {
      socket.broadcast.emit('bc:_filterChanging', data);
    });

    socket.on('ce:_saveFilter', function (data) {
      ImageCon.saveFilter(data);
    });

    socket.on('ce:_changeBackground', function (data) {
      socket.broadcast.emit('bc:_changeBackground', data);
    });

    socket.on('ce:_saveBackground', function (data) {
      config.backgroundColor = data;
    });

    socket.on('ce:_resetPage', function () {
      socket.broadcast.emit('bc:_resetPage');
    });

    socket.on('ce:_deleteImage', function (data) {
      console.log('\n----------- delete image socket -------------\n');
      console.log(data.filenameToDelete);

      socket.broadcast.emit('bc:_deleteImage', data);

      ImageCon.removeImage(data.filenameToDelete);

      if (config.storageOpt.local.del) {
        localAdapter.removeFile(data.filenameToDelete);
      };

      if (config.storageOpt.s3.del) {
        s3Adapter.deleteImage(data.filenameToDelete);
      }
    });

    socket.on('ce:_removeFilter', function (data) {
      socket.broadcast.emit('bc:_removeFilter', data);
    });

    socket.on('ce:_restoreFilter', function (data) {
      socket.broadcast.emit('bc:_restoreFilter', data);
    });

    socket.on('ce:_lockID', function (data) {
      socket.broadcast.emit('bc:_lockID', data);
    });
    socket.on('ce:_unlockID', function (data) {
      socket.broadcast.emit('bc:_unlockID', data);
    });

    socket.on('ce:_hideImage', function (data) {
      socket.broadcast.emit('bc:_hideImage', data);
    });

    socket.on('ce:_showImage', function (data) {
      socket.broadcast.emit('bc:_showImage', data);
    });

    socket.on('ce:_resetImageAll', function (data) {
      ImageCon.resetImageAll(data);
      socket.broadcast.emit('bc:_resetImage', data);
    });

    socket.on('ce:_changeZs', function (zReport) {
      socket.broadcast.emit('bc:_changeZs', zReport);
    });
  });

};
