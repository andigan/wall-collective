// TO DO
// 1. imagick
// 2. graphicsmagick ::
// 3. gm
//        look to see if the image is on the CDN,
//        if it doesn't already exist,
//        create it using libraries above
// 4. image processing microservice
//    goal: npm install
//    serverside outputs images and json
// 5. learn streams, pipes, buffers
// 6. create new directory for imagedir in config file
//    permission changes necessary
//    for now, make sure the directory in config exists.
// 7. console.dir(tempfile);


// ---------------------------------------START--------------------------------------------------------------------

/*
* WhataDrag.js // Server
*
* Version: 0.6.0
* Requires: jQuery v1.7+
*           jquery-ui
*           jquery.form
*           jquery.mobile-events
*           jquery.ui.touch-punch
*           socket.io v1.3.7+
*           interact.js
*
* Copyright (c) 2016 Andrew Nease (andrew.nease.code@gmail.com)
*/

/*
*   Config setup
*     config.js file contains:
*     config.port
*     config.logdir
*     config.publicimagedir
*     config.slashimagedirslash
*     config.resize_dragger_status ||| 'block' or 'none'
*     config.use_cdn
*/
var config = require('./config.js'),
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
  // util = require('util'),
  shortid = require('shortid'),
  // response body parser, breaking the response into objects like req.body.filename
  bodyParser = require('body-parser'),
  // maybe another parser?
  Busboy = require('busboy'),
  // mongodb module, driver
  mongoose = require('mongoose'),
  // BOOKMARK_A routes, users, additional middleware
  // methodOveride allows put and delete
  methodOverride = require('method-override'),

  // temp middleware. not sure what this is doing.  maybe busboy is using it.
  // it splits the request object. e.g. req.body   req.files
  multiparty = require('connect-multiparty');

/*
*     required for busboy?
*/
multipartyMiddleware = multiparty();

// view directory setup
//  express method to set 'views' string.
// path.join is merging __dirname (the main directory) and the string 'views'
app.set('views', path.join(__dirname, 'views'));
// templating set up
nunjucks.configure(path.join(__dirname, 'views'), {
  autoescape: true,
  express: app
});
// utilities set up
// Busboy: The module will populate req.body and req.files like the body-parser module does.
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded());

// app.use mounts the middleware to a specific path
// express.static middleware serves static files, such as .js, .img, .css files
app.use(express.static(path.join(__dirname, 'public')));

// methodOverride middleware allows request method to be specified
app.use(methodOverride());

// BOOKMARK_C error handling

// Initialize server
var server = app.listen(port, function() {
//    console.log('\033[2J'); // clear console
  console.log('Listening on port %d', server.address().port);
});






// socket io
var io = require('socket.io').listen(server);

/*
*   Socket.io
*/


io.on('connection', function (socket) {
  console.log('socket connected...');
  // console.log(socket);

/*
*   Socket.io
*     image changes
*     Listen for changes and modify target
*/

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
     { filename : data.image_filename }  ,            // filter
      { $set: {   transform : data.image_transform,   // set
                  posleft   : data.image_left,
                  postop    : data.image_top,
                  width   : data.image_width,
                  height  : data.image_height }
      },
      { upsert: true //                               // options
      }, function (err) {
        if (err) return console.error(err);           // callback
      }
    ); // end of MaxImage.update
    socket.broadcast.emit('broadcast_resized', data);
  });

  socket.on('clientemit_store_scale_angle', function (data) {

    console.log(data.scale);
    console.log(data.angle);

    MaxImage.update(
      { filename : data.image_filename }  ,             // filter
      { $set: {   scale : data.scale,
                  angle : data.angle  }
      },
      { upsert: true // if query isn't met, creates new document        // options
      }, function (err) {
        if (err) return console.error(err);
      }
    ); // end of MaxImage.update

  //    console.log(data.image_filename);
  //    console.log(data.scale);
    socket.broadcast.emit('broadcast_scaled_angled', data);
  });

  socket.on('clientemit_transforming', function (data) {
    socket.broadcast.emit('broadcast_transforming', data);
  });

  socket.on('clientemit_store_transformed', function (data) {
    MaxImage.update(
     { filename : data.image_filename }  ,             // filter
      { $set: {   matrix  : data.image_transform }
      },
      { upsert: true // if query isn't met, creates new document        // options
      }, function (err) {
        if (err) return console.error(err);
      }
    ); // end of MaxImage.update
  }); // end of socket


  socket.on('clientemit_opacity_changing', function (data) {
    socket.broadcast.emit('broadcast_opacity_changing', data);
  });

  socket.on('clientemit_store_opacity', function (data) {
    MaxImage.update(
      { filename : data.image_filename }  ,             // filter
      { $set: {   opacity : data.current_opacity }
      },
      { upsert: true // if query isn't met, creates new document        // options
      }, function (err) {
        if (err) return console.error(err);
      }
    ); // end of MaxImage.update
  });

  socket.on('clientemit_filter_changing', function (data) {
    socket.broadcast.emit('broadcast_filter_changing', data);
  });

  socket.on('clientemit_store_filter', function (data) {
    MaxImage.update(
      { filename : data.image_filename }  ,             // filter
      { $set: {   filter : data.current_filter }
      },
      { upsert: true // if query isn't met, creates new document        // options
      }, function (err) {
        if (err) return console.error(err);
      }
    ); // end of MaxImage.update
  });

/*
*   Socket.io
*     page changes
*     Listen for reset page, and reload the page
*/

  socket.on('clientemit_resetpage', function () {
    socket.broadcast.emit('broadcast_resetpage');
  });

/*
*   Socket.io
*     upload and delete
*     Handle uploads and deletions
*/

  socket.on('clientemit_share_upload', function (data) {
    var data_from_database = {};

    MaxImage.findOne({filename: data.uploaded_filename}).exec(function (err, result) {
      if (err) return console.error(err);

      data_from_database.domtag = result.domtag;
      data_from_database.image_filename = result.filename;
      data_from_database.z_index = result.zindex;

      socket.broadcast.emit('broadcast_add_upload', data_from_database);
    }); // end of MaxImage.update
  }); // end of socket

  socket.on('clientemit_delete_image', function (data) {
    socket.broadcast.emit('broadcast_delete_image', data);
    console.log('----------- delete image socket -------------');
    console.log(data.selected_filename);

    MaxImage.find({ filename: data.selected_filename }).remove().exec();

    fs.unlink(path.join(__dirname, config.publicimagedir, data.selected_filename), function (err) {
      if (err) throw err;
      console.log('successfully deleted file.');
    });
  }); // end of socket

/*
*   Socket.io
*     additional helpers
*/

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

  socket.on('clientemit_hide_image', function (selected_file_id) {
    socket.broadcast.emit('broadcast_hide_image', selected_file_id);
  });

  socket.on('clientemit_show_image', function (data) {
    socket.broadcast.emit('broadcast_show_image', data);
  });

/*
*   Socket.io
*     change dragger switch status
*/

  socket.on('change_resize_dragger_status', function (data) { config.resize_dragger_status = data; });
  socket.on('change_opacity_dragger_status', function (data) { config.opacity_dragger_status = data; });
  socket.on('change_rotation_dragger_status', function (data) { config.rotation_dragger_status = data; });
  socket.on('change_blur_brightness_dragger_status', function (data) { config.blur_brightness_dragger_status = data; });
  socket.on('change_grayscale_invert_dragger_status', function (data) { config.grayscale_invert_dragger_status = data; });
  socket.on('change_contrast_saturate_dragger_status', function (data) { config.contrast_saturate_dragger_status = data; });
  socket.on('change_party_dragger_status', function (data) { config.party_dragger_status = data; });
}); // end of io.on

/*
*   Mongo.db
*     change dragger switch status
*/

mongoose.connect('mongodb://localhost/' + config.database_name); // connects to max database

// check to make sure MongoDb is connected.
mongoose.connection.on('open', function () {
  console.log('\nConnected to mongo server.\n');
});
// When there is a mongoose error:
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
    domtag: Number,
    filename: String,
    posleft: String,
    postop: String,
    width: String,
    height: String,
    zindex: Number,
    opacity: String,
    matrix: String,
    filter: String,
    scale: String,
    angle: String }),

// Create or use MaxImage using MaxImageSchema
  MaxImage = mongoose.model('MaxImage', MaxImageSchema);

// multer helper function
function image_check(filename) {
  if (path.extname(filename) == '.jpg'
   || path.extname(filename) == '.jpeg'
   || path.extname(filename) == '.png') {
    return true;
  } else return false;
};

/*
*   Main render get
*/

app.get('/', function (req, res) {

// Search the maxImage database to prepare the object to pass to index.html
// sort the results by idtag, ascending order, for consistency in the DOM
// result object will be an array of results
  MaxImage.find({}).sort({idtag: 'asc'}).exec(function (err, result) {

    // create the object to pass to index.html
    var ii = 0,
      data_from_database = {};

    if (err) return console.error(err);

    data_from_database.idtags = [];
    data_from_database.domtags = [];
    data_from_database.filenames = [];
    data_from_database.posleft = [];
    data_from_database.postop = [];
    data_from_database.widths = [];
    data_from_database.heights = [];
    data_from_database.z_indexs = [];
    data_from_database.opacities = [];
    data_from_database.matrixes = [];
    data_from_database.filters = [];
    data_from_database.scales = [];
    data_from_database.angles = [];

    console.log('\nApp.get request from browser.\nMaximage.find.sort for loop:\nPopulating data_from_database to pass to index.html: \n');

    // copy the search results to the new object: data_from_database
    for (ii = 0; ii < result.length; ii++) {
      console.log(ii + '(dom id & zindex) ' + result[ii].idtag);

      data_from_database.idtags[ii] = result[ii].idtag;
      data_from_database.domtags[ii] = result[ii].domtag;
      data_from_database.filenames[ii] = result[ii].filename;
      data_from_database.posleft[ii] = result[ii].posleft;
      data_from_database.postop[ii] = result[ii].postop;
      data_from_database.widths[ii] = result[ii].width;
      data_from_database.heights[ii] = result[ii].height;
      data_from_database.z_indexs[ii] = result[ii].zindex;
      data_from_database.opacities[ii] = result[ii].opacity;
      data_from_database.matrixes[ii] = result[ii].matrix;
      data_from_database.filters[ii] = result[ii].filter;
      data_from_database.scales[ii] = result[ii].scale;
      data_from_database.angles[ii] = result[ii].angle;
    }; // end of for loop

    // a call to render index.html, passing variables through data_from_database object
    res.render('index.html', {

      title               : 'WhataDrag',
      data_from_database  : data_from_database,
      config              : config

    }); // end of render
  }); // end of MaxImagefind
}); // end of app.get('/')

/*
*   Drag post
*     accept the post from the stop function of the jquery drag event in main.js
*     variables sent by main.js:
*       req.body.domtags
*               .filenames
*              .z_indexes
*              .moved_file
*              .moved_posleft
*              .moved_postop
*/

app.post('/dragstop', bodyParser.json(), function (req, res) {
  var i = 0;

  // close ajax connection.  (still keeps the req.body variable)
  res.end();

  // report connection
  console.log('\n---- dragstop post: data received to update database ----\n');
  console.log('req.body.data_for_database.domtags       : ' + req.body.data_for_database.domtags);
  console.log('req.body.data_for_database.filenames     : ' + req.body.data_for_database.filenames);
  console.log('req.body.data_for_database.z_indexes     : ' + req.body.data_for_database.z_indexes);
  console.log('req.body.data_for_database.moved_file    : ' + req.body.data_for_database.moved_file);
  console.log('req.body.data_for_database.moved_posleft : ' + req.body.data_for_database.moved_posleft);
  console.log('req.body.data_for_database.moved_postop  : ' + req.body.data_for_database.moved_postop);
  console.log('\n');

  // updates the MaxImage database, using a filter, operator, options, and callback
  // this is a mongoose method
  // update left/top positions for moved_file's filename
  MaxImage.update(
   { filename : req.body.data_for_database.moved_file}  ,             // filter
    { $set: {   posleft  : req.body.data_for_database.moved_posleft,
                postop   : req.body.data_for_database.moved_postop }
    },
    { upsert: true // if query isn't met, creates new document        // options
    }, function (err) {
      if (err) return console.error(err);
    }
  ); // end of MaxImage.update

  // database update: all z-indexes and domtags, for each filename
  for (i = 0; i < req.body.data_for_database.filenames.length; i++) {

    MaxImage.update(
     { filename : req.body.data_for_database.filenames[i]},             // filter
      { $set: { domtag : req.body.data_for_database.domtags[i],         // operator
                zindex   : req.body.data_for_database.z_indexes[i],}
      },
      { upsert: true                                                    // options
      }, function (err) {
        if (err) return console.error(err);
      }
    ); // end of MaxImage.update
  }; // end of for loop
}); // end of app.post('dragstop') callback

/*
*   Reset page get
*     this route reads the directory, assigns id, sorts by date, clears database,
*     and repopulates database
*/

app.get('/resetpage', function (req, res) {
  var i = 0;

  // fs method to read a directory's filenames
  fs.readdir(config.publicimagedir, function (err, readdir_filenames) {
    // id__filename is a two dimensional array
    // used to sort by modified date
    // provides consistency
    // [ [id, filename]          // id__filename[i][0] is unique id
    //   [id, filename] ]        // id__filename[i][1] is filename
    var id__filename = [];

    if (err) return console.error(err);

    for (i = 0; i < readdir_filenames.length; i++) {
      // only accept image files
      if (image_check(readdir_filenames[i])) {

        // create a unique identifier string: the date + filename
        // fsstatSync: node method that gets file data from the path
        // .mtime: a method to retrieve a 'modification date' object from the fsstatsync
        // .toISOString: a date prototype method that converts the date object to a string
        // .concat: a string prototype that appends a second string
        id__filename.push([fs.statSync( config.publicimagedir + '/' + readdir_filenames[i] ).mtime.toISOString()
                          .concat( readdir_filenames[i] ), readdir_filenames[i] ]);
      }; // end of if
    }; // end of for loop

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
            domtag   : i,
            filename : id__filename[i][1], // filename
            posleft  : '10px',
            postop   : '10px',
            zindex   : i,
            width    : '75px',
            height   : '100px',
            matrix   : 'rotate(0deg) scale(1)',
            opacity  : '1',
            filter   : 'grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)',
            scale    : '1',
            angle    : '0'
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
}); // end of app.get('resetpage') callback

/*
*   add file post
*/

// app.post('/addfile', function (req, res, next) {
app.post('/addfile', function (req, res) {


  // FUTURE WORK: creating a new instance of busboy with request headers
  var busboy = new Busboy({ headers: req.headers });

  // pipe the request into busboy
  req.pipe(busboy);
//  console.log('util.inspect busboy');
//  console.log(util.inspect(busboy));



  // busboy receives req and emits a 'file' event
  busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
    console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);

    // Validate file mimetype
    if ( (mimetype != 'image/png') && (mimetype != 'image/jpeg') ) {
      file.resume();
      console.log('not a valid mimetype');
      res.end();
    } else {


      console.log('busboy.on.file fires...');

      // write the file to the disk as a stream
      file.pipe(fs.createWriteStream(path.join(__dirname, config.publicimagedir, filename)));

      // file's event 'data' chunks triggers this:
      file.on('data', function (data) {
        var uploaddata = data.length;

        console.log('File [' + filename + '] got ' + data.length + ' bytes');
        io.emit('broadcast_chunk_sent', uploaddata);
      });

      // file's event 'end' triggers this:
      file.on('end', function () {
        // get extension from filename
        var extension = path.extname(filename), // node method to get path
          // create unique filename using shortid dependency
          newfilename = shortid.generate() + extension.toLowerCase();

        console.log('File [' + filename + '] Finished');

        // rename file
        console.log('About to fs.rename...');
        fs.rename(path.join(__dirname, config.publicimagedir, filename),
                  path.join(__dirname, config.publicimagedir, newfilename),
                  function () {
                    console.log('file ' + filename + ' renamed: ' + newfilename);

                    // find the highest z-index
                    MaxImage.findOne().sort('-zindex').exec(function (err, highzitem) {
                      if (err) return console.error(err);

                      // console.log('highest zindex' + highzitem.zindex);
                      // find the highest domtag.
                      MaxImage.findOne().sort('-domtag').exec(function (err, highdomitem) {
                        // console.log('highest domtag' + highdomitem.domtag);
                        // create the response.  use it to update the database
                        var ajax_post_response_data = {};

                        if (err) return console.error(err);

                        ajax_post_response_data.idtag = fs.statSync(config.publicimagedir + '/' + newfilename).mtime.toISOString().concat( newfilename );
                        ajax_post_response_data.image_filename = newfilename;

                        // if there are results
                        if (highzitem !== null) {
                          ajax_post_response_data.domtag = highdomitem.domtag + 1;
                          ajax_post_response_data.z_index = highzitem.zindex + 1;
                        // else if there are no results
                        } else {
                          ajax_post_response_data.domtag = 1;
                          ajax_post_response_data.z_index = 1;
                        };

                        MaxImage.update(
                          {           idtag    : ajax_post_response_data.idtag }, // filter
                          { $set: {   domtag   : ajax_post_response_data.domtag,
                                      filename : ajax_post_response_data.image_filename,
                                      posleft  : '0px',
                                      postop   : '0px',
                                      width    : '75px',
                                      height   : 'auto',
                                      matrix   : 'rotate(0deg) scale(1)',
                                      filter   : 'grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)',
                                      opacity  : '100',
                                      zindex   : ajax_post_response_data.z_index,
                                      scale    : '1',
                                      angle    : '0'
                                    }
                          },
                          { upsert: true },
                            function (err) {
                              if (err) return console.error(err);

                              console.log(ajax_post_response_data.image_filename + ' added to database.');

                              // res.writeHead(303, { Connection: 'close', Location: '/' });

                              res.set( { Connection: 'close', Location: '/' });
                              res.send(ajax_post_response_data);
                            } // end of update callback
                        ); // end of MaxImage.update
                      }); // end of maximage findOne dom
                    }); // end of maximage findOne zindex
                  }); // end of fs.rename and it's callback

                  // res.writeHead(303, { Connection: 'close', Location: '/' });
                  // res.end();
      }); // end of file.on(end)
    }; // end of validation if
  }); // end of busboy.on(file)

  busboy.on('finish', function () {
    console.log('Done parsing form, says busboy.on.finish!');
    // res.writeHead(303, { Connection: 'close', Location: '/' });
    // res.end();
  });


  // FUTURE WORK: these currently aren't doing anything
  // busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
  //  console.log('Field [' + fieldname + ']: value: '); // + util.inspect(val));
  // });
  // busboy.on('finish', function() {
  //  console.log('Done parsing form!  Close connection.');
  // });
}); // end of app.post addfile

module.exports = app;
