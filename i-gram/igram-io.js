var config = require('../config/config'),
    uniqueId = require('uniqid'),
    mongoose = require('mongoose'),
    igramAdapter = require('../i-gram/adapters'),
    download = require('../i-gram/helpers/download-helper'),
    IgramSessions = mongoose.model('igram_sessions'),
    ImageDocuments = mongoose.model('images');

module.exports = function (socket, sessionID) {

  // igram-#20: On initial page load, check to see if the client has an access token
  // from a previous authorization.
  // If the sessionID is found in the sessions database,
  // tell the client via socket to prevent repeating authorization when
  // upload button is clicked.
  IgramSessions.count({session_id: sessionID}, function (err, count) {
    if (err) {
      console.log('MongoDB Error: ' + err);
      return false; // or callback
    }
    if (count < 1) {
      console.log('No session found for: ' + sessionID);
      return false;
    } else {
      console.log('Found session for: ' + sessionID);
      socket.emit('se:_HasIgramToken');
    }
    return true; // or callback
  });

  // igram-#7: Fetch igram data
  socket.on('ce:_fetchIgramData', function () {

    // retrieve access token for current session from session database (-#4)
    IgramSessions.findOne({ 'session_id': sessionID }, 'igram_token', function (err, session) {
      if (err) { console.log(err); };

      // fetch the instagram data (-#8)
      if (session !== null) {
        igramAdapter.fetchIgramData(session.igram_token).then(function (results) {
          // console.log fetch results
          // socket.emit('be:_checkOut', results);

          // igram-#10: Send results to client
          socket.emit('se:_addContentToIgramDiv', results);
        });
      }
    });

  });

// igram-#15: Save new image to database; assign dom_id to be consistent on all clients
  socket.on('ce:_igramDrop', function (dropData) {
    // prepare object for database and sending data to clients
    let created = new Date().toISOString(),
        iDBData = {
          iID      : dropData.imageID,
          filename : dropData.owner + '-' + uniqueId() + '.jpg',
          src      : dropData.src,
          owner    : dropData.owner,
          left     : dropData.left,
          top      : dropData.top,
          width    : dropData.width,
          height   : dropData.height,
          link     : dropData.link
        };

    // download dragged instagram image
    download(iDBData.src, config.staticImageDir + '/' + iDBData.filename, function () {
      console.log(iDBData.filename + ' added to directory from instagram feed.');
    });

    // find the highest z-index
    ImageDocuments.findOne().sort('-zindex').exec(function (err, highZItem) {
      if (err) return console.error(err);

      // find the highest dom_id
      ImageDocuments.findOne().sort('-dom_id').exec(function (err, highDOMItem) {

        if (err) return console.error(err);

        // if there are z-index results, add 1
        if (highZItem !== null) {
          iDBData.dom_id = highDOMItem.dom_id + 1;
          iDBData.z_index = highZItem.zindex + 1;
        // else if there are no results, assign value of 1
        } else {
          iDBData.dom_id = 1;
          iDBData.z_index = 1;
        };

        ImageDocuments.update(
          {           sort_id    : created + iDBData.filename },
          { $set: {   dom_id     : iDBData.dom_id,
                      filename   : iDBData.filename,
                      created    : created,
                      url        : iDBData.src,
                      posleft    : iDBData.left,
                      postop     : iDBData.top,
                      width      : iDBData.width,
                      height     : iDBData.height,
                      transform  : 'rotate(0deg) scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg)',
                      filter     : 'grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)',
                      opacity    : '1',
                      zindex     : iDBData.z_index,
                      scale      : '1',
                      angle      : '0',
                      rotateX    : '0deg',
                      rotateY    : '0deg',
                      rotateZ    : '0deg',
                      igram_link : iDBData.link } },
          { upsert: true },
          function (err) {
            if (err) return console.error(err);

            console.log(iDBData.filename + ' added to database from instagram feed.');

            // igram-#16: Send data to client to update dragged image
            socket.emit('se:_changeCloneToImage', iDBData);

            // igram-#18: Send data to other clients to add image
            socket.broadcast.emit('be:_addIgramImageToOtherClients', iDBData);

          }
        );
      });
    });
  });

  // igram-#25: Remove client's access token from database
  socket.on('ce:_removeClientAccessToken', function (sessionID) {
    IgramSessions.find({ session_id: sessionID }).remove().exec();
    console.log('Instagram session ended...');
  });


};
