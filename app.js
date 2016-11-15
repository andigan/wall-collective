

// wall-collective
//
// Version: 0.6.0
// Requires: jQuery v1.7+
//           jquery-ui
//           jquery.form
//           jquery.mobile-events
//           jquery.ui.touch-punch
//           socket.io v1.3.7+
//           interact.js
//
// Copyright (c) 2016 Andrew Nease (andrew.nease.code@gmail.com)

// --Config setup
//     config.js file contains:
//        config.port
//        config.logdir
//        config.static_image_dir
//        config.image_dir
//        config.use_cdn
//        config.database_name

var config = require('./config/config.js'),
  // set the port
  port    =   process.env.PORT || config.port,
  // use express as the framwork
  express = require('express'),
  // create the server
  app = express(),
  // set the templating engine
  nunjucks = require('nunjucks'),
  // utility modules
  fs = require('fs'),
  path = require('path'),
  // util = require('util'), // used to debug; util.inspect(object)
  shortid = require('shortid'),
  // response body parser, breaking the response into objects like req.body.filename
  bodyParser = require('body-parser'),
  // a streaming parser for HTML multipart/form data
  Busboy = require('busboy'),
  // mongoDB driver
  mongoose = require('mongoose'),

  // an array of current client_ids that are connected
  connected_clients = [];

// express method to set 'views' directory string.
// path.join is merging __dirname (the main directory) and the string 'views'
app.set('views', path.join(__dirname, 'views'));
// templating set up
nunjucks.configure(path.join(__dirname, 'views'), {
  autoescape: true,
  express: app
});

// app.use mounts the middleware to a specific path
// express.static middleware serves static files, such as .js, .img, .css files
app.use(express.static(path.join(__dirname, 'public')));

// --Initialize server
var server = app.listen(port, function() {
  console.log('Listening on port %d', server.address().port);
});


// --Helper functions

// image verification
function image_check(filename) {
  if (path.extname(filename) === '.jpg'
   || path.extname(filename) === '.jpeg'
   || path.extname(filename) === '.png'
   || path.extname(filename) === '.gif')
    {
    return true;
  } else return false;
};


// --MongoDB

// connect to database
mongoose.connect('mongodb://localhost/' + config.database_name);

// report the mongoDB connection
mongoose.connection.on('open', function () {
  console.log('\nConnected to mongoDB server.\n');
});

// if there is an error, exit node
mongoose.connection.on('error', function (err) {
  console.log('\nCould not connect to mongoDB server.\n\n\n');
  console.log(err);
  // exit node
  process.exit(0);
});

// When the connection is lost, exit node
mongoose.connection.on('disconnected', function () {
  console.log('\nLost connection to mongo server.\n\n\n');
  // exit node
  process.exit(0);
});

// create a schema.  A schema maps to a collection and 'defines the shape of the documents within that collection.'
var ImageDocumentsSchema = new mongoose.Schema({
    sort_id: String,
    dom_id: Number,
    filename: String,
    posleft: String,
    postop: String,
    width: String,
    height: String,
    zindex: Number,
    opacity: String,
    transform: String,
    filter: String,
    scale: String,
    angle: String,
    rotateX: String,
    rotateY: String,
    rotateZ: String
  }),

  // Create a Model 'we can work with' using the collection name and schema.
  ImageDocuments = mongoose.model(config.collection_name, ImageDocumentsSchema);

// --Socket.io
var io = require('socket.io').listen(server);

// an instance of this function and its variables are created for each client connected
io.on('connection', function (socket) {
  var client_id = '';

  // check to see if the client is new or revisiting with a cookie
  socket.on('clientemit_client_id_check', function (client_vars) {
    client_id = client_vars.client_id;
    // add the image_dir to the object to pass to client
    client_vars.image_dir = config.image_dir;

    // if the client is revisiting, send original client_id to client
    if (client_id !== '' && client_id !== 'null' && client_id !== '[object Object]') {
      console.log(client_id + ' reconnected.');
      socket.emit('connect_set_client_vars', client_vars);

    // else when client is new, generate a new client_id
    } else {
      client_id = shortid.generate();
      console.log(client_id + ' connected for first time.');
      client_vars.client_id = client_id;
      socket.emit('connect_set_client_vars', client_vars);
    };

    // add client_id to connected_clients array
    connected_clients.push(client_id);

    // change user count on all clients
    io.sockets.emit('broadcast_change_user_count', connected_clients);
  });

  // on disconnect
  socket.on('disconnect', function () {
    console.log(client_id + ' disconnected...');
    // remove client_id from connected_clients array
    connected_clients.splice(connected_clients.indexOf(client_id), 1);
    // change user count on remaining clients
    socket.broadcast.emit('broadcast_change_user_count', connected_clients);
  });

  // sockets to share image transformations
  socket.on('clientemit_moving', function (data) {
    socket.broadcast.emit('broadcast_moving', data);
  });

  socket.on('clientemit_store_moved', function (data) {
    socket.broadcast.emit('broadcast_moved', data);
  });

  socket.on('clientemit_resizing', function (data) {
    socket.broadcast.emit('broadcast_resizing', data);
  });

  socket.on('clientemit_store_resized', function (data) {

    ImageDocuments.update(
      // filter
      { filename : data.image_filename },
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

    socket.broadcast.emit('broadcast_resized', data);
  });

  socket.on('clientemit_store_data_attributes', function (data) {
    ImageDocuments.update(
      { filename : data.image_filename },
      { $set: { scale   : data.scale,
                angle   : data.angle,
                rotateX : data.rotateX,
                rotateY : data.rotateY,
                rotateZ : data.rotateZ  } },
      { upsert: true },
      function (err) { if (err) return console.error(err); } );

    socket.broadcast.emit('broadcast_change_data_attributes', data);
  });

  socket.on('clientemit_transforming', function (data) {
    socket.broadcast.emit('broadcast_transforming', data);
  });

  socket.on('clientemit_store_transformed', function (data) {
    ImageDocuments.update(
      { filename : data.image_filename },
      { $set: { transform : data.image_transform } },
      { upsert: true },
      function (err) { if (err) return console.error(err); } );
  });

  socket.on('clientemit_opacity_changing', function (data) {
    socket.broadcast.emit('broadcast_opacity_changing', data);
  });

  socket.on('clientemit_store_opacity', function (data) {
    ImageDocuments.update(
      { filename : data.image_filename },
      { $set: { opacity : data.current_opacity } },
      { upsert: true },
      function (err) { if (err) return console.error(err); } );
  });

  socket.on('clientemit_filter_changing', function (data) {
    socket.broadcast.emit('broadcast_filter_changing', data);
  });

  socket.on('clientemit_store_filter', function (data) {
    ImageDocuments.update(
      { filename : data.image_filename },
      { $set: { filter : data.current_filter } },
      { upsert: true },
      function (err) { if (err) return console.error(err); } );
  });

  socket.on('clientemit_resetpage', function () {
    socket.broadcast.emit('broadcast_resetpage');
  });

  socket.on('clientemit_share_upload', function (data) {
    var data_from_database = {};

    // find matching data.uploaded_filename, return 'result' object
    ImageDocuments.findOne({filename: data.uploaded_filename}).exec(function (err, result) {
      if (err) return console.error(err);

      data_from_database.dom_id = result.dom_id;
      data_from_database.image_filename = result.filename;
      data_from_database.z_index = result.zindex;

      socket.broadcast.emit('broadcast_add_upload', data_from_database);
    });
  });

  socket.on('clientemit_delete_image', function (data) {
    socket.broadcast.emit('broadcast_delete_image', data);
    console.log('----------- delete image socket -------------');
    console.log(data.filename_to_delete);

    // remove from database
    ImageDocuments.find({ filename: data.filename_to_delete }).remove().exec();

    // remove from file system
    fs.unlink(path.join(__dirname, config.static_image_dir, data.filename_to_delete), function (err) {
      if (err) throw err;
      console.log('successfully deleted file.');
    });
  });

  socket.on('clientemit_remove_filter', function (data) {
    socket.broadcast.emit('broadcast_remove_filter', data);
  });

  socket.on('clientemit_restore_filter', function (data) {
    socket.broadcast.emit('broadcast_restore_filter', data);
  });

  socket.on('clientemit_freeze', function (data) {
    socket.broadcast.emit('broadcast_freeze', data);
  });
  socket.on('clientemit_unfreeze', function (data) {
    socket.broadcast.emit('broadcast_unfreeze', data);
  });

  socket.on('clientemit_hide_image', function (data) {
    socket.broadcast.emit('broadcast_hide_image', data);
  });

  socket.on('clientemit_show_image', function (data) {
    socket.broadcast.emit('broadcast_show_image', data);
  });

});


// --Main render get

app.get('/', function (req, res) {

// Use the ImageDocuments model to return an array of documents from the model's collection
// sort the results by sort_id, ascending order, for consistency in the DOM
  ImageDocuments.find({}).sort({sort_id: 'asc'}).exec(function (err, database_result) {

    if (err) return console.error(err);

    console.log('\nApp.get request from browser.\nPopulating data_from_database to pass to index.html: \n');

    // render index.html (using nunjucks templating)
    res.render('index.html', {

      title               : 'wall-collective',
      database_result     : database_result,
      image_count         : database_result.length,
      image_dir           : config.image_dir,
      use_cdn             : config.use_cdn

    });
  });
});

// --Drag post
// accept the post from the stop function of the jQuery draggable event in main.js

app.post('/dragstop', bodyParser.json(), function (req, res) {
  var i = 0;

  // close ajax connection
  res.end();

  // report connection
  console.log('\n---- dragstop post: data received to update database ----\n');
  console.log('req.body.drag_post_data.dom_ids       : ' + req.body.drag_post_data.dom_ids);
  console.log('req.body.drag_post_data.filenames     : ' + req.body.drag_post_data.filenames);
  console.log('req.body.drag_post_data.z_indexes     : ' + req.body.drag_post_data.z_indexes);
  console.log('req.body.drag_post_data.moved_file    : ' + req.body.drag_post_data.moved_file);
  console.log('req.body.drag_post_data.moved_posleft : ' + req.body.drag_post_data.moved_posleft);
  console.log('req.body.drag_post_data.moved_postop  : ' + req.body.drag_post_data.moved_postop);
  console.log('\n');

  // update left/top positions for moved_file's filename
  ImageDocuments.update(
    { filename : req.body.drag_post_data.moved_file },
    { $set: {   posleft  : req.body.drag_post_data.moved_posleft,
                postop   : req.body.drag_post_data.moved_postop } },
    { upsert: true },
    function (err) { if (err) return console.error(err); } );

  // for each filename, update all z-indexes and dom_ids in the database
  for (i = 0; i < req.body.drag_post_data.filenames.length; i++) {

    ImageDocuments.update(
      { filename : req.body.drag_post_data.filenames[i] },
      { $set: { dom_id : req.body.drag_post_data.dom_ids[i],
                zindex   : req.body.drag_post_data.z_indexes[i]} },
      { upsert: true },
      function (err) { if (err) return console.error(err); } );
  };
});

// --Reset page
// this route will clear the database and repopulate the database with a directory's contents

app.get('/resetpage', function (req, res) {
  var i = 0;

  // fs method to read a directory's filenames
  fs.readdir(config.static_image_dir, function (err, dir_filenames) {
    var sorted_ids_filenames = [];

    if (err) return console.error(err);

    for (i = 0; i < dir_filenames.length; i++) {
      // only accept image files
      if (image_check(dir_filenames[i])) {

        // create sorted_ids_filenames, a two-dimensional array used for sorting documents by date
        // sorted_ids_filenames[i][0] = modification date + filename
        // sorted_ids_filenames[i][1] = filename
        // example value:
        //                [[2016-03-10T14:01:17.000ZE1RsRVVRg.jpg, E1RsRVVRg.jpg],
        //                 [2016-03-17T17:03:13.000Zb47GTxyzP.jpg, b47GTxyzP.jpg] ]

        // fsstatSync: node method to get data about a file
        // .mtime: a method to retrieve a 'modification date' object from the fsstatsync result
        // .toISOString: a date prototype method that converts the date object to a string
        // .concat: a string prototype that appends a second string
        sorted_ids_filenames.push([fs.statSync( config.static_image_dir + '/' + dir_filenames[i] ).mtime.toISOString()
                          .concat( dir_filenames[i] ), dir_filenames[i] ]);
      };
    };

    // .sort: an array protype method
    // this .sort method targets alphabetical strings and works for a two-dimensional array because of the [0]
    // http://blog.hao909.com/sorting-a-two-dimensional-array-in-javascript/
    sorted_ids_filenames.sort(function (a,b) {
      var A = a[0],
        B = b[0].toLowerCase();

      A = A.toLowerCase();
      B = B.toLowerCase();
      if (A < B) return -1;
      if (A > B) return 1;
      return 0;
    });

    // clear out the database
    ImageDocuments.remove({}, function (err) {
      var i = 0,
        temp_document;

      if (err) return console.error(err);

      console.log('\nCollection removed.\n\nFiles added to database: \n');

      // repopulate the database
      for (i = 0; i < sorted_ids_filenames.length; i++) {
        console.log(sorted_ids_filenames[i][1]); // filenames
        console.log(sorted_ids_filenames[i][0]); // sort_id

        // create a new document using the ImageDocuments model, then save it to the database
        temp_document = new ImageDocuments(

          { sort_id   : sorted_ids_filenames[i][0],
            dom_id    : i,
            filename  : sorted_ids_filenames[i][1],
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
      file.pipe(fs.createWriteStream(path.join(__dirname, config.static_image_dir, filename)));

      // receiving file's data chunks
      file.on('data', function (data) {
        var uploaddata = {};

        uploaddata.client_id = fieldname;
        uploaddata.chunk_size = data.length;

        console.log('File [' + filename + '] got ' + data.length + ' bytes');
        io.emit('broadcast_chunk_sent', uploaddata);
      });

      file.on('end', function () {
        // get extension from filename using node method
        var extension = path.extname(filename),
          // create unique filename using shortid dependency
          newfilename = shortid.generate() + extension.toLowerCase();

        console.log('File [' + filename + '] Finished');

        // rename file
        console.log('About to fs.rename...');
        fs.rename(path.join(__dirname, config.static_image_dir, filename),
                  path.join(__dirname, config.static_image_dir, newfilename),
                  function () {
                    console.log('file ' + filename + ' renamed: ' + newfilename);

                    // find the highest z-index
                    ImageDocuments.findOne().sort('-zindex').exec(function (err, highzitem) {
                      if (err) return console.error(err);

                      // find the highest dom_id
                      ImageDocuments.findOne().sort('-dom_id').exec(function (err, highdomitem) {
                        var upload_response = {};

                        if (err) return console.error(err);

                        // prepare upload_response for client
                        upload_response.image_filename = newfilename;

                        // if there are z-index results, add 1
                        if (highzitem !== null) {
                          upload_response.dom_id = highdomitem.dom_id + 1;
                          upload_response.z_index = highzitem.zindex + 1;
                        // else if there are no results, assign value of 1
                        } else {
                          upload_response.dom_id = 1;
                          upload_response.z_index = 1;
                        };

                        ImageDocuments.update(
                          {           sort_id   : fs.statSync(config.static_image_dir + '/' + newfilename).mtime.toISOString().concat( newfilename ) },
                          { $set: {   dom_id    : upload_response.dom_id,
                                      filename  : upload_response.image_filename,
                                      posleft   : '0px',
                                      postop    : '0px',
                                      width     : '75px',
                                      height    : '100px',
                                      transform : 'rotate(0deg) scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg)',
                                      filter    : 'grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)',
                                      opacity   : '1',
                                      zindex    : upload_response.z_index,
                                      scale     : '1',
                                      angle     : '0',
                                      rotateX   : '0deg',
                                      rotateY   : '0deg',
                                      rotateZ   : '0deg' } },
                          { upsert: true },
                          function (err) {
                            if (err) return console.error(err);

                            console.log(upload_response.image_filename + ' added to database.');

                            res.set( { Connection: 'close', Location: '/' });
                            res.send(upload_response);
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

module.exports = app;
