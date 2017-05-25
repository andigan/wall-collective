var config = require('../config/config.js'),
    express = require('express'),
    router = express.Router(),

    bodyParser = require('body-parser'), // parse response into objects (req.body.filename)

    path = require('path'),
    Busboy = require('busboy'), // streaming parser for HTML multipart/form data
    uniqueId = require('uniqid'), // id generator

    ImageCon = require('../db/controllers/image-controller'),
    s3Adapter = require('../adapters/s3'),
    localAdapter = require('../adapters/local');

// home page
router.get('/', function (req, res) {
  if (req.query.error) { console.log(req.query.error); };

  // future work; io cookie
  if (req.cookies) {
    console.log('\n cookies: ');
    console.log(req.cookies);
    console.log('\n');
  };

  function renderPage(databaseResult) {
    res.render('index.handlebars', {
      title          : 'wall-collective',
      databaseResult : databaseResult,
      useCDN         : config.useCDN,
      useIGram       : config.useIGram
    });
  }

  // fetch images from DB and render page
  ImageCon.fetchPageLoad(renderPage);

});


router.post('/dragstop', bodyParser.json(), function (req, res) {

  // close ajax connection
  res.end();

  ImageCon.dragStopUpdate(req.body.dropPost);
});

// --Reset page
// this route will clear the database and repopulate the database with chosen contents
// assigning new ids and zIndexes
router.get('/resetpage', function (req, res) {

  if (req.cookies) {
    console.log('******' + req.cookies.sessionID + ' reset the page.');
  };

  function closeResponse() {
    res.sendStatus(200);
  }

  switch (config.reloadFrom) {
    case 'db':
      ImageCon.resetDBImages(closeResponse);
      break;
    case 'local':
      ImageCon.reseedFromLocal(closeResponse);
      break;
    case 's3':
      ImageCon.reseedFromS3(closeResponse);
      break;
    default:
      break;
  }
});

// --Add file post
router.post('/addfile', function (req, res) {
  var busboy = new Busboy({ headers: req.headers });

  // pipe the request into busboy parser
  req.pipe(busboy);

  // get data from form fields (fires after file)
  busboy.on('field', function (fieldname, val) {
    if (fieldname === 'filesize') {
      console.log(val);
    };
  });

  busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
    var extension = path.extname(filename),
        newFilename = fieldname + '-' + uniqueId() + extension.toLowerCase();

    console.log('sessionID: ' + fieldname + ': filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);

    // validate file mimetype
    if ( (mimetype != 'image/png') && (mimetype != 'image/jpeg') ) {
      file.resume();
      res.set({ Connection: 'close', Location: '/' });
      res.send({ error: 'not a valid mimetype' });
    } else {

      // save image
      if (config.storageOpt.local.save) {
        // write the file to the disk as a stream

        file.pipe(localAdapter.handleSaveStream(newFilename));

        if (config.UrlToDB === 'local') {
          file.on('end', function () {
            ImageCon.addUploadToDB(newFilename, fieldname, res.io);
            res.end();
          });
        };
      };

      if (config.storageOpt.s3.save) {
        if (config.UrlToDB === 's3' || config.UrlToDB === 'db') {
          res.end();
        };

        // write the file to Amazon s3 as a stream
        file.pipe(s3Adapter.uploadStreamHandler(newFilename))
            .on('error', function (err) {
              console.error(err);
            })

            .on('finish', function () {
              console.log('on.finish');
              if (config.UrlToDB === 's3' || config.UrlToDB === 'db') {
                ImageCon.addUploadToDB(newFilename, fieldname, res.io);
              };
            });
      }

      if (config.storageOpt.cloudinary.save) {
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
