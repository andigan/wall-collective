var config = require('../config/config'),
    shortid = require('shortid'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    InstaSessions = mongoose.model('insta_sessions'),
    ImageDocuments = mongoose.model('images');

module.exports = function (socket, client_id, download, adapters) {

  // insta_step 23: On initial load, check to see if the client has already authenticated with Instagram
  // and received an access token
  // if the client_id is a key, client has an access token

  // is called when the instagram button is clicked, to keep from repeating api links
  InstaSessions.count({session_id: client_id}, function (err, count) {
    if (err) {
      console.log("MongoDB Error: " + err);
      return false; // or callback
    }
    if (count < 1) {
      console.log("No session found.");
      return false;
    } else {
      console.log('Found session: ' + client_id);
      socket.emit('insta_access_ready');
      }
      return true; // or callback
  });


  // insta_step 7: Fetch Instagram data
  socket.on('get_instagram_data', function () {

    // retrieve access token for current session from database
    InstaSessions.findOne({ 'session_id': client_id }, 'inst_access_token', function (err, session) {
      if (err) { console.log(err); };

      // fetch the instagram data
      adapters.fetchInstaData(session.inst_access_token).then(function (results) {
        // socket.emit('check_out', results;
        // insta_step 9: Send results to client
        socket.emit('add_content_to_insta_div', results);
      });
    });

  });

  // insta_step 13: Save the remote Instagram image to local storage
  socket.on('client_emit_save_insta_image', function (dragged_image_info) {

    var new_file = {};

    new_file.newfilename = shortid.generate() + '.jpg';
    new_file.image_index = dragged_image_info.id;

    // download dragged instagram image
    download(dragged_image_info.src, config.staticImageDir + '/' + new_file.newfilename, function () {
      console.log(new_file.newfilename + ' added to directory from instagram feed.');

      // insta_step 14: Send newfilename and index to client
      socket.emit('insta_download_ready', new_file);
    }); // end of download callback
  });


  // insta_step 18: Save new image to database; assign dom_id to be consistent on all clients
  socket.on('client_emit_insta_drop', function (insta_drop_data) {

    // prepare object for database and sending data to clients
    var insta_database_parameters = {
      insta_id       : insta_drop_data.insta_id,
      insta_filename : insta_drop_data.insta_filename,
      location       : config.imageDir,
      posleft        : insta_drop_data.posleft + 'px',
      postop         : insta_drop_data.postop + 'px',
      width          : insta_drop_data.insta_width,
      height         : insta_drop_data.insta_height,
      insta_link     : insta_drop_data.insta_link
    };

    // find the highest z-index
    ImageDocuments.findOne().sort('-zindex').exec(function (err, highZItem) {
      if (err) return console.error(err);

      // find the highest dom_id
      ImageDocuments.findOne().sort('-dom_id').exec(function (err, highDOMItem) {

        if (err) return console.error(err);

        // if there are z-index results, add 1
        if (highZItem !== null) {
          insta_database_parameters.dom_id = highDOMItem.dom_id + 1;
          insta_database_parameters.z_index = highZItem.zindex + 1;
        // else if there are no results, assign value of 1
        } else {
          insta_database_parameters.dom_id = 1;
          insta_database_parameters.z_index = 1;
        };

        ImageDocuments.update(
          {           sort_id    : fs.statSync(config.staticImageDir + '/' + insta_drop_data.insta_filename).mtime.toISOString().concat( insta_drop_data.insta_filename ) },
          { $set: {   dom_id     : insta_database_parameters.dom_id,
                      filename   : insta_drop_data.insta_filename,
                      location   : config.imageDir,
                      posleft    : insta_drop_data.posleft + 'px',
                      postop     : insta_drop_data.postop + 'px',
                      width      : insta_drop_data.insta_width,
                      height     : insta_drop_data.insta_height,
                      transform  : 'rotate(0deg) scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg)',
                      filter     : 'grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)',
                      opacity    : '1',
                      zindex     : insta_database_parameters.z_index,
                      scale      : '1',
                      angle      : '0',
                      rotateX    : '0deg',
                      rotateY    : '0deg',
                      rotateZ    : '0deg',
                      insta_link : insta_database_parameters.insta_link } },
          { upsert: true },
          function (err) {
            if (err) return console.error(err);

            console.log(insta_drop_data.insta_filename + ' added to database from instagram feed.');
            console.log(insta_database_parameters.insta_link);

            // insta_step 19: Send data to client to update dragged image
            socket.emit('change_clone_to_image', insta_database_parameters);

            // insta_step 21: Send data to other clients to add image
            socket.broadcast.emit('add_insta_image_to_other_clients', insta_database_parameters);

          } // end of update callback
        ); // end of ImageDocuments update
      }); // end of ImageDocuments findOne dom_id
    }); // end of ImageDocuments findOne z-index
  });

  // insta_step 27: Remove client's access token from database
  socket.on('client_emit_remove_client_from_clients_access', function (session_id) {
    InstaSessions.find({ session_id: session_id }).remove().exec();
    console.log('Instagram session ended...');
  });


};
