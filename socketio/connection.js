var config = require('../config/config'),
    secrets = require('../i-gram/config/secrets.js'),
    fs = require('fs'),
    path = require('path'),
    shortID = require('shortid'),
    download = require('../i-gram/helpers/download-helper'),
    instaAdapter = require('../i-gram/adapters'),
    mongoose = require('mongoose'),
    ImageDocuments = mongoose.model('images'),
    connectedClients = [], // an array of current sessionIDs that are connected
    instaSockets;

module.exports = function (io) {

  // an instance of this function and its variables are created for each client connected
  io.on('connection', function (socket) {
    var sessionID = '';

    // check to see if the client is new or revisiting with a cookie
    socket.on('ce:  sessionID_check', function (clientVars) {
      sessionID = clientVars.sessionID;

      // add the instagram_app_id
      clientVars.instaAppID = secrets.instaAppID;

      // add backgroundColor
      clientVars.backgroundColor = config.backgroundColor;

      // if the client is revisiting, send original sessionID to client
      if (sessionID !== '' && sessionID !== 'null' && sessionID !== '[object Object]') {
        console.log(sessionID + ' reconnected.');
        socket.emit('connect_set_clientVars', clientVars);

      // else when client is new, generate a new sessionID
      } else {
        sessionID = shortID.generate();
        console.log(sessionID + ' connected for first time.');
        clientVars.sessionID = sessionID;
        socket.emit('connect_set_clientVars', clientVars);
      };

      // add sessionID to connectedClients array
      connectedClients.push(sessionID);

      // change user count on all clients
      io.sockets.emit('bc: change_user_count', connectedClients);


      if (config.useIGram) {
        instaSockets = require('../i-gram/sockets.js');
        instaSockets(socket, sessionID, download, instaAdapter);
      };


    });

    // on disconnect
    socket.on('disconnect', function () {
      console.log(sessionID + ' disconnected...');
      // remove sessionID from connectedClients array
      connectedClients.splice(connectedClients.indexOf(sessionID), 1);
      // change user count on remaining clients
      socket.broadcast.emit('bc: change_user_count', connectedClients);
    });

    // sockets to share image transformations
    socket.on('ce:  moving', function (data) {
      socket.broadcast.emit('bc: moving', data);
    });

    socket.on('ce:  store_moved', function (data) {
      socket.broadcast.emit('bc: moved', data);
    });

    socket.on('ce:_resizing', function (data) {
      socket.broadcast.emit('bc: resizing', data);
    });

    socket.on('ce:_saveResize', function (data) {

      ImageDocuments.update(
        // filter
        { filename : data.imageFilename },
        // set
        { $set: { transform : data.imageTransform,
                  posleft   : data.imageLeft,
                  postop    : data.imageTop,
                  width     : data.imageWidth,
                  height    : data.imageHeight } },
        // options
        { upsert: true }, // if query isn't met, creates new document
        // callback
        function (err) { if (err) return console.error(err); } );

      socket.broadcast.emit('bc: resized', data);
    });

    socket.on('ce:_saveDataAttributes', function (data) {
      ImageDocuments.update(
        { filename : data.imageFilename },
        { $set: { scale   : data.scale,
                  angle   : data.angle,
                  rotateX : data.rotateX,
                  rotateY : data.rotateY,
                  rotateZ : data.rotateZ  } },
        { upsert: true },
        function (err) { if (err) return console.error(err); } );

      socket.broadcast.emit('bc: change_data_attributes', data);
    });

    socket.on('ce:_transforming', function (data) {
      socket.broadcast.emit('bc: transforming', data);
    });

    socket.on('ce:_saveTransform', function (data) {
      ImageDocuments.update(
        { filename : data.imageFilename },
        { $set: { transform : data.imageTransform } },
        { upsert: true },
        function (err) { if (err) return console.error(err); } );
    });

    socket.on('ce:_opacityChanging', function (data) {
      socket.broadcast.emit('bc: opacity_changing', data);
    });

    socket.on('ce:_saveOpacity', function (data) {
      ImageDocuments.update(
        { filename : data.imageFilename },
        { $set: { opacity : data.imageOpacity } },
        { upsert: true },
        function (err) { if (err) return console.error(err); } );
    });

    socket.on('ce:_filterChanging', function (data) {
      socket.broadcast.emit('bc: filter_changing', data);
    });

    socket.on('ce:_saveFilter', function (data) {
      ImageDocuments.update(
        { filename : data.imageFilename },
        { $set: { filter : data.imageFilter } },
        { upsert: true },
        function (err) { if (err) return console.error(err); } );
    });

    socket.on('ce:_changeBackground', function (data) {
      socket.broadcast.emit('bc:_changeBackground', data);
    });

    socket.on('ce:_saveBackground', function (data) {
      config.backgroundColor = data;
    });

    socket.on('ce:_resetPage', function () {
      socket.broadcast.emit('bc: resetpage');
    });

    socket.on('ce:  share_upload', function (data) {
      var dbImageData = {};

      // find matching data.uploadedFilename, return 'result' object
      ImageDocuments.findOne({filename: data.uploadedFilename}).exec(function (err, result) {
        if (err) return console.error(err);

        dbImageData.dom_id = result.dom_id;
        dbImageData.imageFilename = result.filename;
        dbImageData.location = result.location;
        dbImageData.z_index = result.zindex;

        socket.broadcast.emit('bc: add_upload', dbImageData);
      });
    });

    socket.on('ce:  delete_image', function (data) {
      socket.broadcast.emit('bc: delete_image', data);
      console.log('----------- delete image socket -------------');
      console.log(data.filenameToDelete);

      // remove from database
      ImageDocuments.find({ filename: data.filenameToDelete }).remove().exec();

      // remove from file system
      fs.unlink(path.join(config.mainDir, config.staticImageDir, data.filenameToDelete), function (err) {
        if (err) throw err;
        console.log('successfully deleted file.');
      });
    });

    socket.on('ce:_removeFilter', function (data) {
      socket.broadcast.emit('bc: remove_filter', data);
    });

    socket.on('ce:_restoreFilter', function (data) {
      socket.broadcast.emit('bc: restore_filter', data);
    });

    socket.on('ce:  freeze', function (data) {
      socket.broadcast.emit('bc: freeze', data);
    });
    socket.on('ce:  unfreeze', function (data) {
      socket.broadcast.emit('bc: unfreeze', data);
    });

    socket.on('ce:_hideImage', function (data) {
      socket.broadcast.emit('bc: hide_image', data);
    });

    socket.on('ce:  show_image', function (data) {
      socket.broadcast.emit('bc: show_image', data);
    });

  });

};
