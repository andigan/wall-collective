var config = require('../config/config'),
    s3 = require('../mods/aws')(),
    s3UploadStream = require('s3-stream-upload');

module.exports = {

  uploadStreamHandler(filename) {
    return s3UploadStream(s3, { Bucket: config.bucket, Key: filename, ACL: 'public-read' });
  },

  deleteImage(filename) {

    s3.deleteObject({  Bucket: config.bucket, Key: filename }, function (err, data) {
      if (err) {
        console.log(err, err.stack);
      } else {
        console.log('If existed, deleted from s3: ' + filename + '\n');
      };
    });

  }

};
