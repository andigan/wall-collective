var express = require('express'),
    config = require('../config/config.js'),
    router = express.Router(),
    bodyParser = require('body-parser'), // parse response into objects (req.body.filename)
    mongoose = require('mongoose'),
    fs = require('fs'),
    Busboy = require('busboy'), // streaming parser for HTML multipart/form data
    helpers = require('../helpers'),
    path = require('path'),
    shortID = require('shortid');

// home page
router.get('/', function (req, res) {

  var ImageDocuments = mongoose.model('images');

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
      openInstagramDiv  : (typeof req.query.open_instagram_div !== 'undefined')
    });
  });
});


// --Drag post
// accept the ajax post from the stop function of the jQuery draggable event in main.js
router.post('/dragstop', bodyParser.json(), function (req, res) {
  var i = 0,
      dropPost = req.body.dropPost,
      ImageDocuments = mongoose.model('images');

  // close ajax connection
  res.end();

  console.log('\n---- dropPost data received to update database ----\n');
  console.log('dom_ids   : ' + dropPost.domIDs);
  console.log('filenames : ' + dropPost.filenames);
  console.log('z_indexes : ' + dropPost.zIndexes);
  console.log('dFilename : ' + dropPost.dFilename);
  console.log('dLeft     : ' + dropPost.dLeft);
  console.log('dTop      : ' + dropPost.dTop + '\n');

  // update left/top positions for moved_file's filename
  ImageDocuments.update(
    { filename : dropPost.dFilename },
    { $set: {   posleft  : dropPost.dLeft,
                postop   : dropPost.dTop } },
    { upsert: true },
    function (err) { if (err) return console.error(err); } );

  // for each filename, update all z-indexes and dom_ids in the database
  for (i = 0; i < dropPost.filenames.length; i++) {

    ImageDocuments.update(
      { filename : dropPost.filenames[i] },
      { $set: { dom_id : dropPost.domIDs[i],
                zindex   : dropPost.zIndexes[i]} },
      { upsert: true },
      function (err) { if (err) return console.error(err); } );
  };
});

// --Reset page
// this route will clear the database and repopulate the database with a directory's contents
router.get('/resetpage', function (req, res) {
  var i,
  ImageDocuments = mongoose.model('images');

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
router.post('/addfile', function (req, res) {
  var ImageDocuments = mongoose.model('images'),
      busboy = new Busboy({ headers: req.headers });

  // pipe the request into busboy
  req.pipe(busboy);

  // busboy receives request and emits a 'file' event
  busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
    console.log('sessionID: ' + fieldname + ': filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);

    // validate file mimetype
    if ( (mimetype != 'image/png') && (mimetype != 'image/jpeg') ) {
      file.resume();
      console.log('not a valid mimetype');
      res.end();
    } else {

      console.log('busboy.on.file fires...');

      // write the file to the disk as a stream
      file.pipe(fs.createWriteStream(path.join(config.mainDir, config.staticImageDir, filename)));

      // receiving file's data chunks
      file.on('data', function (data) {
        var uploaddata = {};

        uploaddata.sessionID = fieldname;
        uploaddata.chunkSize = data.length;

        console.log('File [' + filename + '] got ' + data.length + ' bytes');
        res.io.emit('bc: chunk_sent', uploaddata);
      });

      file.on('end', function () {
        // get extension from filename using node method
        var extension = path.extname(filename),
            // create unique filename using shortid dependency
            newFilename = shortID.generate() + extension.toLowerCase();

        console.log('File [' + filename + '] Finished');

        // rename file
        console.log('About to fs.rename...');
        fs.rename(path.join(config.mainDir, config.staticImageDir, filename),
                  path.join(config.mainDir, config.staticImageDir, newFilename),
                  function () {
                    console.log('file ' + filename + ' renamed: ' + newFilename);

                    // find the highest z-index
                    ImageDocuments.findOne().sort('-zindex').exec(function (err, highZItem) {
                      if (err) return console.error(err);

                      // find the highest dom_id
                      ImageDocuments.findOne().sort('-dom_id').exec(function (err, highDOMItem) {
                        var uploadResponse = {};

                        if (err) return console.error(err);

                        // prepare uploadResponse for client
                        uploadResponse.imageFilename = newFilename;
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
                          {           sort_id   : fs.statSync(config.staticImageDir + '/' + newFilename).mtime.toISOString().concat( newFilename ) },
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

module.exports = router;
