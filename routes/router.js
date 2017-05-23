var express = require('express'),
    config = require('../config/config.js'),
    router = express.Router(),
    bodyParser = require('body-parser'), // parse response into objects (req.body.filename)
    mongoose = require('mongoose'),
    fs = require('fs'),
    Busboy = require('busboy'), // streaming parser for HTML multipart/form data
    helpers = require('../helpers'),
    path = require('path'),
    shortID = require('shortid'),
    uniqueId = require('uniqid'),
    AWS = require('aws-sdk'),
    secrets = require('../config/secrets.js'),
    accessKeyId =  process.env.AWS_ACCESS_KEY || secrets.s3accessKeyId,
    secretAccessKey = process.env.AWS_SECRET_KEY || secrets.s3secretAccessKey,
    s3UploadStream = require('s3-stream-upload'),
    s3;

AWS.config.update({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey
});

s3 = new AWS.S3();

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
      location            : config.loadFromLoc,
      useCDN              : config.useCDN,
      useIGram            : config.useIGram
    });
  });
});


// --Drag post
// accept the ajax post from the stop function of the jQuery draggable event in main.js
router.post('/dragstop', bodyParser.json(), function (req, res) {
  let i = 0,
      dropPost = req.body.dropPost,
      ImageDocuments = mongoose.model('images');

  // close ajax connection
  res.end();

  console.log('\n---- dropPost data received to update database ----\n');
  console.log('dom_ids   : ' + dropPost.domIDs);
  console.log('filenames : ' + dropPost.filenames);
  console.log('z_indexes : ' + dropPost.zIndexes);
  console.log('dFilename : ' + dropPost.dFilename);
  console.log('posLeft   : ' + dropPost.posLeft);
  console.log('posTop    : ' + dropPost.posTop + '\n');

  // update left/top positions for moved_file's filename
  ImageDocuments.update(
    { filename : dropPost.dFilename },
    { $set: {   posleft  : dropPost.posLeft,
                postop   : dropPost.posTop } },
    { upsert: true },
    function (err) { if (err) return console.error(err); } );

  // for each filename, update all z-indexes and dom_ids in the database
  for (i = 0; i < dropPost.filenames.length; i++) {

    ImageDocuments.update(
      { filename : dropPost.filenames[i] },
      { $set: { dom_id : dropPost.domIDs[i],
                zindex : dropPost.zIndexes[i]} },
      { upsert: true },
      function (err) { if (err) return console.error(err); } );
  };
});




function resetToDirectory(res) {

  // fs method to read a directory's filenames
  fs.readdir(config.staticImageDir, function (err, dirFilenames) {
    let sorted;

    if (err) return console.error(err);

    sorted = dirFilenames.filter(function (filename) {
      return helpers.imageCheck(filename);
    }).map(function (filename) {
      // create sorted, a two-dimensional array used for sorting documents by date
      // sorted[0] = [ modification date, filename ]
      // e.g.
      //   [[2016-03-10T14:01:17.000Z, E1RsRVVRg.jpg],
      //   [2016-03-17T17:03:13.000Z, b47GTxyzP.jpg] ]

      // fsstatSync: node method to get data about a file
      // .mtime: a method to retrieve a 'modification date' object from the fsstatsync result
      // .toISOString: a date prototype method that converts the date object to a string
      return [fs.statSync( config.staticImageDir + '/' + filename ).mtime.toISOString(), filename ];
    }).sort(helpers.twoDSort);

    resetDatabase(sorted, res);
  });
}

function resetTos3(res) {

  // limit of 1000 keys
  s3.listObjectsV2( { Bucket: config.bucket }, function (err, data) {
    let imagesDate;

    if (err) {
      console.log(err, err.stack);
    } else {
      imagesDate  = data.Contents.map(function (image) {
        return [image.LastModified.toISOString(), image.Key];
      });

      imagesDate.sort(helpers.twoDSort);

      resetDatabase(imagesDate, res);
    };
  });
}


function resetDatabase(sortedDateFilenames, res) {
  var ImageDocuments = mongoose.model('images');

  // clear out the database
  ImageDocuments.remove({}, function (err) {
    if (err) return console.error(err);

    console.log('\nCollection removed.\n\nFiles added to database: \n');

    sortedDateFilenames.forEach(function (dateFilename, i) {
      console.log(dateFilename[1]);
      // create a new document using the ImageDocuments model, then save it to the database
      new ImageDocuments(

        { sort_id   : dateFilename[0] + dateFilename[1],
          dom_id    : i,
          filename  : dateFilename[1],
          location  : config.imageDir,
          created   : dateFilename[0],
          owner     : dateFilename[1].split('-')[0],
          posleft   : '10%',
          postop    : '10%',
          zindex    : i,
          width     : '20%',
          height    : '20%',
          transform : 'rotate(0deg) scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg)',
          opacity   : '1',
          filter    : 'grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)',
          scale     : '1',
          angle     : '0',
          rotateX   : '0deg',
          rotateY   : '0deg',
          rotateZ   : '0deg'
        })
      // .save is a mongoose method for model prototypes .save(function (err, tempfile) { });
      .save(function (err) { if (err) return console.error(err); });
    });

    console.log('\nCollection replaced.\n\n');
    res.sendStatus(200);
  }); // end of ImageDocuments.remove callback





}



// --Reset page
// this route will clear the database and repopulate the database with chosen contents
router.get('/resetpage', function (req, res) {

  if (config.loadFrom === 'local') {
    resetToDirectory(res);
  };

  if (config.loadFrom === 's3') {
    resetTos3(res);
  };

});

function uploadUpdate(newFilename, sessionID, io) {
  var ImageDocuments = mongoose.model('images');

  // find the highest ID
  ImageDocuments.find().sort({'dom_id':-1}).limit(1).select('dom_id').exec(function (err, highestIdRecord) {
    if (err) return console.error(err);

    // find the highest z-index
    ImageDocuments.find().sort({'zindex':-1}).limit(1).select('zindex').exec(function (err, highestzIndexRecord) {
      let newImage = {};

      if (err) return console.error(err);

      newImage.filename = newFilename;
      newImage.owner = sessionID;
      newImage.src = config.loadFromLoc + newFilename;

      // if database is empty...
      if (highestIdRecord.length < 1) {
        newImage.domId = 0;
        newImage.zIndex = 0;
      } else {
        newImage.domId = highestIdRecord[0].dom_id + 1;
        newImage.zIndex = highestzIndexRecord[0].zindex + 1;
      };

      newImage.left = '10%';
      newImage.top = '10%';
      newImage.width = '20%';
      newImage.height = '20%';

      ImageDocuments.update(
        {           filename   : newFilename },
        { $set: {   dom_id     : newImage.domId,
                    zindex     : newImage.zIndex,
                    owner      : sessionID,
                    created    : new Date,
                    posleft    : newImage.left,
                    postop     : newImage.top,
                    width      : newImage.width,
                    height     : newImage.height,
                    transform  : 'rotate(0deg) scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg)',
                    filter     : 'grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)',
                    opacity    : '1',
                    scale      : '1',
                    angle      : '0',
                    rotateX    : '0deg',
                    rotateY    : '0deg',
                    rotateZ    : '0deg' }
        },
        { upsert: true },
        // update completion callback
        function (err) {
          if (err) {
            return console.error(err);
          } else {
            console.log(newFilename + ' added to database.');

            // add image to all connected pages
            io.emit('se:_addUploadToPage', newImage);
          }
        });
    });
  });
}

// --Add file post
router.post('/addfile', function (req, res) {
  var busboy = new Busboy({ headers: req.headers }),
      filesize = 0;

  // pipe the request into busboy parser
  req.pipe(busboy);

// get data from form fields (fires after file)
  busboy.on('field', function (fieldname, val) {
    if (fieldname === 'filesize') {
      filesize = val;
    };
  });

  busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
    var extension = path.extname(filename),
        newFilename = fieldname + '-' + uniqueId() + extension.toLowerCase();

    console.log('sessionID: ' + fieldname + ': filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);

    // validate file mimetype
    if ( (mimetype != 'image/png') && (mimetype != 'image/jpeg') ) {
      file.resume();
      res.set( { Connection: 'close', Location: '/' });
      res.send({ error: 'not a valid mimetype' });
    } else {

      // save image
      if (config.uploadTo.local) {
        // write the file to the disk as a stream
        file.pipe(fs.createWriteStream(path.join(config.mainDir, config.staticImageDir, newFilename)));

        if (config.loadFrom === 'local') {
          file.on('end', function () {
            uploadUpdate(newFilename, fieldname, res.io);
            res.end();
          });
        };
      };

      if (config.uploadTo.s3) {

        if (config.loadFrom === 's3') {
          res.end();
        };

        // write the file to Amazon s3 as a stream
        file.pipe(s3UploadStream(s3, { Bucket: config.bucket, Key: newFilename, ACL: 'public-read' }))

        .on('error', function (err) {
          console.error(err);
        })

        .on('finish', function () {
          if (config.loadFrom === 's3') {
            uploadUpdate(newFilename, fieldname, res.io);
          };
        });
      }

      if (config.uploadTo.cloudinary) {
        console.log('cloudinary');
      };

      // receiving file's data chunks
      file.on('data', function (data) {
        var uploadData = {};

        uploadData.sessionID = fieldname;
        uploadData.chunkSize = data.length;

        console.log('File [' + filename + '] got ' + data.length + ' bytes');
        res.io.emit('bc:_uploadChunkSent', uploadData);
      });
    }; // end of image validation
  }); // end of busboy.on(file)

  busboy.on('finish', function () {
    console.log('Busboy done parsing form.');
  });
});

module.exports = router;
