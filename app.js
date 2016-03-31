

// WhataDrag.js
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
  // dragger status.  used to set dragger switches on/off when client loads page
  dragger_status = {};

// initial dragger status display
dragger_status.stretch           = false;
dragger_status.opacity           = false;
dragger_status.rotation          = false;
dragger_status.blur_brightness   = false;
dragger_status.grayscale_invert  = false;
dragger_status.contrast_saturate = false;
dragger_status.party             = false;
dragger_status.threeD            = false;
dragger_status.newer             = false;

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
//    console.log('\033[2J'); // clear console
  console.log('Listening on port %d', server.address().port);
});

// --Socket.io
var io = require('socket.io').listen(server);

io.on('connection', function (socket) {
  console.log('socket connected...');

  // initial set up.  send dragger_status to connected client
  socket.emit('connect_assign_dragger_status', dragger_status);

  // initial set up.  send image directory to connected client
  socket.emit('connect_assign_image_dir', config.image_dir);

  // initial set up.  send unique identifier to client
  socket.emit('connect_assign_unique_id', shortid.generate());

  // change dragger_switch_status
  socket.on('change_stretch_dragger_status', function (data) { dragger_status.stretch = data; });
  socket.on('change_opacity_dragger_status', function (data) { dragger_status.opacity = data; });
  socket.on('change_rotation_dragger_status', function (data) { dragger_status.rotation = data; });
  socket.on('change_blur_brightness_dragger_status', function (data) { dragger_status.blur_brightness = data; });
  socket.on('change_grayscale_invert_dragger_status', function (data) { dragger_status.grayscale_invert = data; });
  socket.on('change_contrast_saturate_dragger_status', function (data) { dragger_status.contrast_saturate = data; });
  socket.on('change_threeD_dragger_status', function (data) { dragger_status.threeD = data; });
  socket.on('change_party_dragger_status', function (data) { dragger_status.party = data; });

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

    MaxImage.update(
      // filter
      { filename : data.image_filename
      },
      // set
      { $set: { transform : data.image_transform,
                posleft   : data.image_left,
                postop    : data.image_top,
                width     : data.image_width,
                height    : data.image_height }
      },
      // options
      { upsert: true // if query isn't met, creates new document
      },
      // callback
      function (err) {
        if (err) return console.error(err);           // callback
      }
    );
    socket.broadcast.emit('broadcast_resized', data);
  });

  socket.on('clientemit_store_data_attributes', function (data) {
    MaxImage.update(
      { filename : data.image_filename
      },
      { $set: { scale   : data.scale,
                angle   : data.angle,
                rotateX : data.rotateX,
                rotateY : data.rotateY,
                rotateZ : data.rotateZ
      }
      },
      { upsert: true
      },
      function (err) {
        if (err) return console.error(err);
      }
    );
    socket.broadcast.emit('broadcast_change_data_attributes', data);
  });

  socket.on('clientemit_transforming', function (data) {
    socket.broadcast.emit('broadcast_transforming', data);
  });

  socket.on('clientemit_store_transformed', function (data) {
    MaxImage.update(
      { filename : data.image_filename
      },
      { $set: { transform : data.image_transform }
      },
      { upsert: true
      },
      function (err) {
        if (err) return console.error(err);
      }
    );
  });

  socket.on('clientemit_opacity_changing', function (data) {
    socket.broadcast.emit('broadcast_opacity_changing', data);
  });

  socket.on('clientemit_store_opacity', function (data) {
    MaxImage.update(
      { filename : data.image_filename
      },
      { $set: { opacity : data.current_opacity }
      },
      { upsert: true
      },
      function (err) {
        if (err) return console.error(err);
      }
    );
  });

  socket.on('clientemit_filter_changing', function (data) {
    socket.broadcast.emit('broadcast_filter_changing', data);
  });

  socket.on('clientemit_store_filter', function (data) {
    MaxImage.update(
      { filename : data.image_filename
      },
      { $set: { filter : data.current_filter }
      },
      { upsert: true
      },
      function (err) {
        if (err) return console.error(err);
      }
    );
  });

  socket.on('clientemit_resetpage', function () {
    socket.broadcast.emit('broadcast_resetpage');
  });

  socket.on('clientemit_share_upload', function (data) {
    var data_from_database = {};

    // find matching data.uploaded_filename, return 'result' object
    MaxImage.findOne({filename: data.uploaded_filename}).exec(function (err, result) {
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
    MaxImage.find({ filename: data.filename_to_delete }).remove().exec();

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


// --MongoDB

mongoose.connect('mongodb://localhost/' + config.database_name); // connects to max database

// check to make sure MongoDb is connected.
mongoose.connection.on('open', function () {
  console.log('\nConnected to mongo server.\n');
});
// if there is an error:
mongoose.connection.on('error', function (err) {
  console.log('\nCould not connect to mongo server.\n\n\n');
  console.log(err);
  // exit node
  process.exit(0);
});
// When the connection is disconnected:
mongoose.connection.on('disconnected', function () {
  console.log('\nLost connection to mongo server.\n\n\n');
  // exit node
  process.exit(0);
});


var MaxImageSchema = new mongoose.Schema({
    idtag: String,
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

// Create or use MaxImage using MaxImageSchema
  MaxImage = mongoose.model('MaxImage', MaxImageSchema);

// image verification
function image_check(filename) {
  if (path.extname(filename) == '.jpg'
   || path.extname(filename) == '.jpeg'
   || path.extname(filename) == '.png') {
    return true;
  } else return false;
};

// --Main render get

app.get('/', function (req, res) {

// Search the maxImage database to prepare the object to pass to index.html
// sort the results by idtag, ascending order, for consistency in the DOM
// result object will be an array of results
  MaxImage.find({}).sort({idtag: 'asc'}).exec(function (err, database_result) {

    if (err) return console.error(err);

    console.log('\nApp.get request from browser.\nPopulating data_from_database to pass to index.html: \n');

    // a call to render index.html, passing variables through data_from_database object
    res.render('index.html', {

      title               : 'WhataDrag',
      database_result     : database_result,
      image_count         : database_result.length,
      image_dir           : config.image_dir,
      use_cdn             : config.use_cdn

    });
  });
});

// --Drag post
// accept the post from the stop function of the jquery drag event in main.js

app.post('/dragstop', bodyParser.json(), function (req, res) {
  var i = 0;

  // close ajax connection.  (still keeps the req.body variable)
  res.end();

  // report connection
  console.log('\n---- dragstop post: data received to update database ----\n');
  console.log('req.body.data_for_database.dom_ids       : ' + req.body.data_for_database.dom_ids);
  console.log('req.body.data_for_database.filenames     : ' + req.body.data_for_database.filenames);
  console.log('req.body.data_for_database.z_indexes     : ' + req.body.data_for_database.z_indexes);
  console.log('req.body.data_for_database.moved_file    : ' + req.body.data_for_database.moved_file);
  console.log('req.body.data_for_database.moved_posleft : ' + req.body.data_for_database.moved_posleft);
  console.log('req.body.data_for_database.moved_postop  : ' + req.body.data_for_database.moved_postop);
  console.log('\n');

  // update left/top positions for moved_file's filename
  MaxImage.update(
    { filename : req.body.data_for_database.moved_file
    },
    { $set: {   posleft  : req.body.data_for_database.moved_posleft,
                postop   : req.body.data_for_database.moved_postop }
    },
    { upsert: true
    },
    function (err) {
      if (err) return console.error(err);
    }
  );

  // database update all z-indexes and dom_ids, for each filename
  for (i = 0; i < req.body.data_for_database.filenames.length; i++) {

    MaxImage.update(
      { filename : req.body.data_for_database.filenames[i]
      },
      { $set: { dom_id : req.body.data_for_database.dom_ids[i],
                zindex   : req.body.data_for_database.z_indexes[i]}
      },
      { upsert: true
      }, function (err) {
        if (err) return console.error(err);
      }
    );
  };
});

// --Reset page get
// this route reads the directory, assigns id, sorts by date, clears database,
// and repopulates database

app.get('/resetpage', function (req, res) {
  var i = 0;

  // fs method to read a directory's filenames
  fs.readdir(config.static_image_dir, function (err, dir_filenames) {
    // id__filename is a two dimensional array
    // used to sort files by modified date and provide consistency
    // [ [id, filename]          // id__filename[i][0] is unique id, starting with modified date
    //   [id, filename] ]        // id__filename[i][1] is filename
    var id__filename = [];

    if (err) return console.error(err);

    for (i = 0; i < dir_filenames.length; i++) {
      // only accept image files
      if (image_check(dir_filenames[i])) {

        // create a unique identifier string: the date + filename
        // fsstatSync: node method that gets file data from the path
        // .mtime: a method to retrieve a 'modification date' object from the fsstatsync
        // .toISOString: a date prototype method that converts the date object to a string
        // .concat: a string prototype that appends a second string
        // example result: id__filename = [2016-03-30T04:01:17.000ZE1RsRVVRg.jpg, E1RsRVVRg.jpg]
        id__filename.push([fs.statSync( config.static_image_dir + '/' + dir_filenames[i] ).mtime.toISOString()
                          .concat( dir_filenames[i] ), dir_filenames[i] ]);

        console.log(id__filename[0]);
      };
    };

    // sort the id__filename array
    // .sort: an array protype method
    // sort works naturally with date objects, no matter how they are displayed
    // this .sort targets alphabetical strings
    // this sort works for a two dimensional array because of the [0]
    // sort function source:
    // http://blog.hao909.com/sorting-a-two-dimensional-array-in-javascript/
    id__filename.sort(function (a,b) {
      var A = a[0],
        B = b[0].toLowerCase();

      A = A.toLowerCase();
      B = B.toLowerCase();
      if (A < B) return -1;
      if (A > B) return 1;
      return 0;
    });

    // clear out the database
    MaxImage.remove({}, function (err) {
      var i = 0,
        temp_document;

      if (err) return console.error(err);

      console.log('\nCollection removed.\n\nFiles added to database: \n');

      // repopulate the database
      for (i = 0; i < id__filename.length; i++) {
        console.log(id__filename[i][1]); // filenames
        console.log(id__filename[i][0]); // unique identifier used for sorting

        // create a new document, then save it to the database
        temp_document = new MaxImage(

          { idtag    : id__filename[i][0], // unique identifier
            dom_id   : i,
            filename : id__filename[i][1], // filename
            posleft  : '10px',
            postop   : '10px',
            zindex   : i,
            width    : '75px',
            height   : '100px',
            transform   : 'rotate(0deg) scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg)',
            opacity  : '1',
            filter   : 'grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)',
            scale    : '1',
            angle    : '0',
            rotateX  : '0deg',
            rotateY  : '0deg',
            rotateZ  : '0deg'
          });
        // .save is a mongoose method for model prototypes .save(function (err, tempfile) { });
        temp_document.save(function (err) {
          if (err) return console.error(err);
        });
      }; // end of for loop
      console.log('\nCollection replaced.\n\n');
      res.end(); // ajax post will refresh page
    }); // end of MaxImage.remove callback
  }); // end of fs.readdir callback
}); // end of app.get('resetpage')


// --Add file post

app.post('/addfile', function (req, res) {

  // FUTURE WORK: creating a new instance of busboy with request headers
  var busboy = new Busboy({ headers: req.headers });

  // pipe the request into busboy
  req.pipe(busboy);

  // busboy receives req and emits a 'file' event
  busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
    console.log('unique_id: ' + fieldname + ': filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);

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

        uploaddata.uploader_unique_id = fieldname;
        uploaddata.chunk_size = data.length;

        console.log('File [' + filename + '] got ' + data.length + ' bytes');
        io.emit('broadcast_chunk_sent', uploaddata);
      });

      file.on('end', function () {
        // get extension from filename
        var extension = path.extname(filename), // node method to get path
          // create unique filename using shortid dependency
          newfilename = shortid.generate() + extension.toLowerCase();

        console.log('File [' + filename + '] Finished');

        // rename file to unique id
        console.log('About to fs.rename...');
        fs.rename(path.join(__dirname, config.static_image_dir, filename),
                  path.join(__dirname, config.static_image_dir, newfilename),
                  function () {
                    console.log('file ' + filename + ' renamed: ' + newfilename);

                    // find the highest z-index
                    MaxImage.findOne().sort('-zindex').exec(function (err, highzitem) {
                      if (err) return console.error(err);

                      // find the highest dom_id.
                      MaxImage.findOne().sort('-dom_id').exec(function (err, highdomitem) {
                        var ajax_post_response_data = {};

                        if (err) return console.error(err);

                        // create unique id for new file
                        ajax_post_response_data.idtag = fs.statSync(config.static_image_dir + '/' + newfilename).mtime.toISOString().concat( newfilename );
                        ajax_post_response_data.image_filename = newfilename;

                        // if there are z-index results, add 1
                        if (highzitem !== null) {
                          ajax_post_response_data.dom_id = highdomitem.dom_id + 1;
                          ajax_post_response_data.z_index = highzitem.zindex + 1;
                        // else if there are no results, assign value of 1
                        } else {
                          ajax_post_response_data.dom_id = 1;
                          ajax_post_response_data.z_index = 1;
                        };

                        MaxImage.update(
                          {           idtag    : ajax_post_response_data.idtag
                          },
                          { $set: {   dom_id   : ajax_post_response_data.dom_id,
                                      filename : ajax_post_response_data.image_filename,
                                      posleft  : '0px',
                                      postop   : '0px',
                                      width    : '75px',
                                      height   : '100px',
                                      transform   : 'rotate(0deg) scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg)',
                                      filter   : 'grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)',
                                      opacity  : '1',
                                      zindex   : ajax_post_response_data.z_index,
                                      scale    : '1',
                                      angle    : '0',
                                      rotateX  : '0deg',
                                      rotateY  : '0deg',
                                      rotateZ  : '0deg'
                                  }
                          },
                          { upsert: true
                          },
                          function (err) {
                            if (err) return console.error(err);

                            console.log(ajax_post_response_data.image_filename + ' added to database.');

                            res.set( { Connection: 'close', Location: '/' });
                            res.send(ajax_post_response_data);
                          } // end of update callback
                        ); // end of MaxImage.update
                      }); // end of maximage findOne dom
                    }); // end of maximage findOne zindex
                  }); // end of fs.rename and it's callback
      }); // end of file.on(end)
    }; // end of image validation if
  }); // end of busboy.on(file)

  busboy.on('finish', function () {
    console.log('Done parsing form, says busboy.on.finish.');
  });
}); // end of app.post addfile

module.exports = app;
