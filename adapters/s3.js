var config = require('../config/config'),
    s3 = require('../mods/aws')();

module.exports = {

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
