

// wall-collective
//
// Version: 0.7.0
// Requires: jQuery v1.7+
//           jquery-ui
//           jquery.form
//           jquery.mobile-events
//           jquery.ui.touch-punch
//           socket.io v1.3.7+
//           interact.js
//
// Copyright (c) 2018 Andrew Nease (andrew.nease.code@gmail.com)

var config = require('./config/config'),
    port = process.env.PORT || config.port,

    // express framework; create the server using express
    express = require('express'),
    app = express(),

    // MongoDB; function to connect to database, create models, declare models
    mongoose = require('mongoose'),
    dbInit = require('./db/db-init'),
    ImageDocuments,
//    UserDocuments,

    // instagram section
    secrets = require('./i-gram/config/secrets'),
    download = require('./i-gram/helpers/download-helper'),
    instaAuth = require('./i-gram/auth/instagram_auth.js'), // authorization middleware
    instaAdapter = require('./i-gram/adapters'),

    // oauth and sessions; set up passport serialization; manage sessions; save sessions to db
//    passport = require('passport'),
//    passportInit = require('./auth/passport-init'),
//    session = require('express-session'),
//    MongoStore = require('connect-mongo')(session),

    // templating engine
    handlebars = require('express-handlebars'),
    hbHelpers = require('./views/helpers'),

    // utility modules
    fs = require('fs'),
    path = require('path'),
    helpers = require('./helpers'),
    shortid = require('shortid'),
    bodyParser = require('body-parser'), // parse response into objects (req.body.filename)
    Busboy = require('busboy'), // streaming parser for HTML multipart/form data

    // an array of current client_ids that are connected
    connectedClients = [],
    server = {},
    io = {};


// express method to set 'views' directory
// path.join merges __dirname (the main directory) and the string 'views'
app.set('views', path.join(__dirname, 'views'));

// set up templating engine
app.engine('handlebars', handlebars(
  { defaultLayout: 'main',
    helpers: hbHelpers,
    partialsDir: [ 'shared/templates/', 'views/partials/' ]
  }));
app.set('view engine', 'handlebars');

// app.use mounts the middleware
// express.static middleware serves static files, such as .js, .img, .css files
app.use(express.static(path.join(__dirname, 'public')));

// set up database
dbInit();
ImageDocuments = mongoose.model('images');
UserDocuments = mongoose.model('users');

// middleware for instagram authorization
if (config.useIGram) {
  app.use(instaAuth);
};

// --Initialize server
server = app.listen(port, function () {
  console.log('Listening on port %d', server.address().port);
});

// routing
app.get('/', function (req, res) {

  if (typeof req.query.error !== 'undefined') { console.log(req.query.error); };

  // Retrieve an array of image documents from the database
  // sort the results by sort_id, ascending order, for consistency in the DOM
  ImageDocuments.find({}).sort({sort_id: 'asc'}).exec(function (err, databaseResult) {

    if (err) return console.error(err);

    console.log('Image data retrieved from database to pass to index.html...\n');

    res.render('index.handlebars', {
      title               : 'wall-collective',
      databaseResult      : databaseResult,
      useCDN              : config.useCDN,
      useIGram            : config.useIGram,

      // insta_step 5: Load the page with the instagram div open.
      // if the request contains the query parameter ?open_instagram_div (from i-gram auth)
      // set the open_instagram_div to true to pass to index.html
      open_instagram_div  : (typeof req.query.open_instagram_div !== 'undefined')
    });
  });

}); // end of app.get


// --Drag post
// accept the post from the stop function of the jQuery draggable event in main.js

app.post('/dragstop', bodyParser.json(), function (req, res) {
  var i = 0,
      dropPost = req.body.dropPost;

  // close ajax connection
  res.end();

  // report connection
  console.log('\n---- dropPost data received to update database ----\n');
  console.log('dom_ids       : ' + dropPost.dom_ids);
  console.log('filenames     : ' + dropPost.filenames);
  console.log('z_indexes     : ' + dropPost.z_indexes);
  console.log('moved_file    : ' + dropPost.moved_file);
  console.log('moved_posleft : ' + dropPost.moved_posleft);
  console.log('moved_postop  : ' + dropPost.moved_postop + '\n');

  // update left/top positions for moved_file's filename
  ImageDocuments.update(
    { filename : dropPost.moved_file },
    { $set: {   posleft  : dropPost.moved_posleft,
                postop   : dropPost.moved_postop } },
    { upsert: true },
    function (err) { if (err) return console.error(err); } );

  // for each filename, update all z-indexes and dom_ids in the database
  for (i = 0; i < dropPost.filenames.length; i++) {

    ImageDocuments.update(
      { filename : dropPost.filenames[i] },
      { $set: { dom_id : dropPost.dom_ids[i],
                zindex   : dropPost.z_indexes[i]} },
      { upsert: true },
      function (err) { if (err) return console.error(err); } );
  };
});

// --Reset page
// this route will clear the database and repopulate the database with a directory's contents
app.get('/resetpage', function (req, res) {
  var i;

  // fs method to read a directory's filenames
  fs.readdir(config.staticImageDir, function (err, dirFilenames) {
    var sortedIdsFilenames = [];

    if (err) return console.error(err);

    for (i = 0; i < dirFilenames.length; i++) {
      // only accept image files
      if (helpers.imageCheck(dirFilenames[i])) {

        // create sortedIdsFilenames, a two-dimensional array used for sorting documents by date
        // sortedIdsFilenames[i][0] = modification date + filename
        // sortedIdsFilenames[i][1] = filename
        // example value:
        //                [[2016-03-10T14:01:17.000ZE1RsRVVRg.jpg, E1RsRVVRg.jpg],
        //                 [2016-03-17T17:03:13.000Zb47GTxyzP.jpg, b47GTxyzP.jpg] ]

        // fsstatSync: node method to get data about a file
        // .mtime: a method to retrieve a 'modification date' object from the fsstatsync result
        // .toISOString: a date prototype method that converts the date object to a string
        // .concat: a string prototype method that appends a second string
        sortedIdsFilenames.push([fs.statSync( config.staticImageDir + '/' + dirFilenames[i] ).mtime.toISOString().concat( dirFilenames[i] ), dirFilenames[i] ]);
      };
    };

    // .sort: an array protype method (destructive)
    sortedIdsFilenames.sort(helpers.twoDSort);

    // retrieve insta_links from database
    ImageDocuments.find({}).sort({sort_id: 'asc'}).exec(function (err, databaseResult) {
      if (err) return console.error(err);

      // not sure what I was doing here
      console.log(databaseResult);


      // clear out the database
      ImageDocuments.remove({}, function (err) {
        var i = 0,
            temp_document;

        if (err) return console.error(err);

        console.log('\nCollection removed.\n\nFiles added to database: \n');

        // repopulate the database
        for (i = 0; i < sortedIdsFilenames.length; i++) {
          console.log(sortedIdsFilenames[i][1]); // filenames
          console.log(sortedIdsFilenames[i][0]); // sort_id

          // create a new document using the ImageDocuments model, then save it to the database
          temp_document = new ImageDocuments(

            { sort_id   : sortedIdsFilenames[i][0],
              dom_id    : i,
              filename  : sortedIdsFilenames[i][1],
              location  : config.imageDir,
              posleft   : '10px',
              postop    : '10px',
              zindex    : i,
              width     : '75px',
              height    : '100px',
              transform : 'rotate(0deg) scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg)',
              opacity   : '1',
              filter    : 'grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)',
              scale     : '1',
              angle     : '0',
              rotateX   : '0deg',
              rotateY   : '0deg',
              rotateZ   : '0deg'
            });
          // .save is a mongoose method for model prototypes .save(function (err, tempfile) { });
          temp_document.save(function (err) { if (err) return console.error(err); });
        }; // end of for loop
        console.log('\nCollection replaced.\n\n');
        res.end();
      }); // end of ImageDocuments.remove callback
    });
  }); // end of fs.readdir callback
}); // end of app.get('resetpage')



// --Add file post
app.post('/addfile', function (req, res) {

  var busboy = new Busboy({ headers: req.headers });

  // pipe the request into busboy
  req.pipe(busboy);

  // busboy receives request and emits a 'file' event
  busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
    console.log('client_id: ' + fieldname + ': filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);

    // validate file mimetype
    if ( (mimetype != 'image/png') && (mimetype != 'image/jpeg') ) {
      file.resume();
      console.log('not a valid mimetype');
      res.end();
    } else {

      console.log('busboy.on.file fires...');

      // write the file to the disk as a stream
      file.pipe(fs.createWriteStream(path.join(__dirname, config.staticImageDir, filename)));

      // receiving file's data chunks
      file.on('data', function (data) {
        var uploaddata = {};

        uploaddata.client_id = fieldname;
        uploaddata.chunkSize = data.length;

        console.log('File [' + filename + '] got ' + data.length + ' bytes');
        io.emit('bc: chunk_sent', uploaddata);
      });

      file.on('end', function () {
        // get extension from filename using node method
        var extension = path.extname(filename),
          // create unique filename using shortid dependency
          newfilename = shortid.generate() + extension.toLowerCase();

        console.log('File [' + filename + '] Finished');

        // rename file
        console.log('About to fs.rename...');
        fs.rename(path.join(__dirname, config.staticImageDir, filename),
                  path.join(__dirname, config.staticImageDir, newfilename),
                  function () {
                    console.log('file ' + filename + ' renamed: ' + newfilename);

                    // find the highest z-index
                    ImageDocuments.findOne().sort('-zindex').exec(function (err, highZItem) {
                      if (err) return console.error(err);

                      // find the highest dom_id
                      ImageDocuments.findOne().sort('-dom_id').exec(function (err, highDOMItem) {
                        var uploadResponse = {};

                        if (err) return console.error(err);

                        // prepare uploadResponse for client
                        uploadResponse.imageFilename = newfilename;
                        uploadResponse.location = config.imageDir;

                        // if there are z-index results, add 1
                        if (highZItem !== null) {
                          uploadResponse.dom_id = highDOMItem.dom_id + 1;
                          uploadResponse.z_index = highZItem.zindex + 1;
                        // else if there are no results, assign value of 1
                        } else {
                          uploadResponse.dom_id = 1;
                          uploadResponse.z_index = 1;
                        };

                        ImageDocuments.update(
                          {           sort_id   : fs.statSync(config.staticImageDir + '/' + newfilename).mtime.toISOString().concat( newfilename ) },
                          { $set: {   dom_id    : uploadResponse.dom_id,
                                      filename  : uploadResponse.imageFilename,
                                      location  : config.imageDir,
                                      posleft   : '0px',
                                      postop    : '0px',
                                      width     : '75px',
                                      height    : '100px',
                                      transform : 'rotate(0deg) scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg)',
                                      filter    : 'grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)',
                                      opacity   : '1',
                                      zindex    : uploadResponse.z_index,
                                      scale     : '1',
                                      angle     : '0',
                                      rotateX   : '0deg',
                                      rotateY   : '0deg',
                                      rotateZ   : '0deg' } },
                          { upsert: true },
                          function (err) {
                            if (err) return console.error(err);

                            console.log(uploadResponse.imageFilename + ' added to database.');

                            res.set( { Connection: 'close', Location: '/' });
                            res.send(uploadResponse);
                          } // end of update callback
                        ); // end of ImageDocuments update
                      }); // end of ImageDocuments findOne dom_id
                    }); // end of ImageDocuments findOne z-index
                  }); // end of fs.rename and callback
      }); // end of file.on(end)
    }; // end of image validation if
  }); // end of busboy.on(file)

  busboy.on('finish', function () {
    console.log('Done parsing form, says busboy.on.finish.');
  });
});


// --Socket.io
io = require('socket.io').listen(server);

// an instance of this function and its variables are created for each client connected
io.on('connection', function (socket) {
  var client_id = '';

  // check to see if the client is new or revisiting with a cookie
  socket.on('c-e:  client_id_check', function (clientVars) {
    client_id = clientVars.client_id;

    // add the instagram_app_id
    clientVars.instaAppID = secrets.instaAppID;


    // if the client is revisiting, send original client_id to client
    if (client_id !== '' && client_id !== 'null' && client_id !== '[object Object]') {
      console.log(client_id + ' reconnected.');
      socket.emit('connect_set_clientVars', clientVars);

    // else when client is new, generate a new client_id
    } else {
      client_id = shortid.generate();
      console.log(client_id + ' connected for first time.');
      clientVars.client_id = client_id;
      socket.emit('connect_set_clientVars', clientVars);
    };

    // add client_id to connectedClients array
    connectedClients.push(client_id);

    // change user count on all clients
    io.sockets.emit('bc: change_user_count', connectedClients);


    if (config.useIGram) {
      var insta_sockets = require('./i-gram/sockets.js');

      insta_sockets(socket, client_id, download, instaAdapter);
    };


  });

  // on disconnect
  socket.on('disconnect', function () {
    console.log(client_id + ' disconnected...');
    // remove client_id from connectedClients array
    connectedClients.splice(connectedClients.indexOf(client_id), 1);
    // change user count on remaining clients
    socket.broadcast.emit('bc: change_user_count', connectedClients);
  });

  // sockets to share image transformations
  socket.on('c-e:  moving', function (data) {
    socket.broadcast.emit('bc: moving', data);
  });

  socket.on('c-e:  store_moved', function (data) {
    socket.broadcast.emit('bc: moved', data);
  });

  socket.on('c-e:  resizing', function (data) {
    socket.broadcast.emit('bc: resizing', data);
  });

  socket.on('c-e:  store_resized', function (data) {

    ImageDocuments.update(
      // filter
      { filename : data.imageFilename },
      // set
      { $set: { transform : data.image_transform,
                posleft   : data.image_left,
                postop    : data.image_top,
                width     : data.image_width,
                height    : data.image_height } },
      // options
      { upsert: true }, // if query isn't met, creates new document
      // callback
      function (err) { if (err) return console.error(err); } );

    socket.broadcast.emit('bc: resized', data);
  });

  socket.on('c-e:  store_data_attributes', function (data) {
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

  socket.on('c-e:  transforming', function (data) {
    socket.broadcast.emit('bc: transforming', data);
  });

  socket.on('c-e:  store_transformed', function (data) {
    ImageDocuments.update(
      { filename : data.imageFilename },
      { $set: { transform : data.image_transform } },
      { upsert: true },
      function (err) { if (err) return console.error(err); } );
  });

  socket.on('c-e:  opacity_changing', function (data) {
    socket.broadcast.emit('bc: opacity_changing', data);
  });

  socket.on('c-e:  store_opacity', function (data) {
    ImageDocuments.update(
      { filename : data.imageFilename },
      { $set: { opacity : data.current_opacity } },
      { upsert: true },
      function (err) { if (err) return console.error(err); } );
  });

  socket.on('c-e:  filter_changing', function (data) {
    socket.broadcast.emit('bc: filter_changing', data);
  });

  socket.on('c-e:  store_filter', function (data) {
    ImageDocuments.update(
      { filename : data.imageFilename },
      { $set: { filter : data.current_filter } },
      { upsert: true },
      function (err) { if (err) return console.error(err); } );
  });

  socket.on('c-e:  resetpage', function () {
    socket.broadcast.emit('bc: resetpage');
  });

  socket.on('c-e:  share_upload', function (data) {
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

  socket.on('c-e:  delete_image', function (data) {
    socket.broadcast.emit('bc: delete_image', data);
    console.log('----------- delete image socket -------------');
    console.log(data.filenameToDelete);

    // remove from database
    ImageDocuments.find({ filename: data.filenameToDelete }).remove().exec();

    // remove from file system
    fs.unlink(path.join(__dirname, config.staticImageDir, data.filenameToDelete), function (err) {
      if (err) throw err;
      console.log('successfully deleted file.');
    });
  });

  socket.on('c-e:  remove_filter', function (data) {
    socket.broadcast.emit('bc: remove_filter', data);
  });

  socket.on('c-e:  restore_filter', function (data) {
    socket.broadcast.emit('bc: restore_filter', data);
  });

  socket.on('c-e:  freeze', function (data) {
    socket.broadcast.emit('bc: freeze', data);
  });
  socket.on('c-e:  unfreeze', function (data) {
    socket.broadcast.emit('bc: unfreeze', data);
  });

  socket.on('c-e:  hide_image', function (data) {
    socket.broadcast.emit('bc: hide_image', data);
  });

  socket.on('c-e:  show_image', function (data) {
    socket.broadcast.emit('bc: show_image', data);
  });

}); // end of io.on('connection', function (socket) {

module.exports = app;
