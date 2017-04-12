var config = require('../config/config'),
    shortID = require('shortid'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    InstaSessions = mongoose.model('insta_sessions'),
    ImageDocuments = mongoose.model('images');

module.exports = function (socket, sessionID, download, adapters) {

  // insta_step 23: On initial load, check to see if the client has already authenticated with Instagram
  // and received an access token
  // if the sessionID is a key, client has an access token

  // is called when the instagram button is clicked, to keep from repeating api links
  InstaSessions.count({session_id: sessionID}, function (err, count) {
    if (err) {
      console.log('MongoDB Error: ' + err);
      return false; // or callback
    }
    if (count < 1) {
      console.log('No session found.');
      return false;
    } else {
      console.log('Found session: ' + sessionID);
      socket.emit('ce: insta_access_ready');
    }
    return true; // or callback
  });


  // insta_step 7: Fetch Instagram data
  socket.on('ce: get_instagram_data', function () {

    // retrieve access token for current session from database
    InstaSessions.findOne({ 'session_id': sessionID }, 'inst_access_token', function (err, session) {
      if (err) { console.log(err); };

      // fetch the instagram data
      adapters.fetchInstaData(session.inst_access_token).then(function (results) {
        // socket.emit('check_out', results;
        // insta_step 9: Send results to client
        socket.emit('se: add_content_to_insta_div', results);
      });
    });

  });

  // insta_step 13: Save the remote Instagram image to local storage
  socket.on('ce: save_insta_image', function (instaDraggedImage) {

    var newFileData = {};

    newFileData.newFilename = shortID.generate() + '.jpg';
    newFileData.iIndex = instaDraggedImage.id;

    // download dragged instagram image
    download(instaDraggedImage.src, config.staticImageDir + '/' + newFileData.newFilename, function () {
      console.log(newFileData.newFilename + ' added to directory from instagram feed.');

      // insta_step 14: Send newFilename and index to client
      socket.emit('ce: insta_download_ready', newFileData);
    }); // end of download callback
  });


  // insta_step 18: Save new image to database; assign dom_id to be consistent on all clients
  socket.on('ce: insta_drop', function (instaDropData) {

    // prepare object for database and sending data to clients
    var instaDBData = {
      iID       : instaDropData.iID,
      iFilename : instaDropData.iFilename,
      location       : config.imageDir,
      posleft        : instaDropData.posleft + 'px',
      postop         : instaDropData.postop + 'px',
      width          : instaDropData.iWidth,
      height         : instaDropData.iHeight,
      insta_link     : instaDropData.iLink
    };

    // find the highest z-index
    ImageDocuments.findOne().sort('-zindex').exec(function (err, highZItem) {
      if (err) return console.error(err);

      // find the highest dom_id
      ImageDocuments.findOne().sort('-dom_id').exec(function (err, highDOMItem) {

        if (err) return console.error(err);

        // if there are z-index results, add 1
        if (highZItem !== null) {
          instaDBData.dom_id = highDOMItem.dom_id + 1;
          instaDBData.z_index = highZItem.zindex + 1;
        // else if there are no results, assign value of 1
        } else {
          instaDBData.dom_id = 1;
          instaDBData.z_index = 1;
        };

        ImageDocuments.update(
          {           sort_id    : fs.statSync(config.staticImageDir + '/' + instaDropData.iFilename).mtime.toISOString().concat( instaDropData.iFilename ) },
          { $set: {   dom_id     : instaDBData.dom_id,
                      filename   : instaDropData.iFilename,
                      location   : config.imageDir,
                      posleft    : instaDropData.posleft + 'px',
                      postop     : instaDropData.postop + 'px',
                      width      : instaDropData.iWidth,
                      height     : instaDropData.iHeight,
                      transform  : 'rotate(0deg) scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg)',
                      filter     : 'grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)',
                      opacity    : '1',
                      zindex     : instaDBData.z_index,
                      scale      : '1',
                      angle      : '0',
                      rotateX    : '0deg',
                      rotateY    : '0deg',
                      rotateZ    : '0deg',
                      insta_link : instaDBData.insta_link } },
          { upsert: true },
          function (err) {
            if (err) return console.error(err);

            console.log(instaDropData.iFilename + ' added to database from instagram feed.');
            console.log(instaDBData.insta_link);

            // insta_step 19: Send data to client to update dragged image
            socket.emit('se: change_clone_to_image', instaDBData);

            // insta_step 21: Send data to other clients to add image
            socket.broadcast.emit('be: add_insta_image_to_other_clients', instaDBData);

          } // end of update callback
        ); // end of ImageDocuments update
      }); // end of ImageDocuments findOne dom_id
    }); // end of ImageDocuments findOne z-index
  });

  // insta_step 27: Remove client's access token from database
  socket.on('ce: remove_client_from_clients_access', function (sessionID) {
    InstaSessions.find({ session_id: sessionID }).remove().exec();
    console.log('Instagram session ended...');
  });


};
