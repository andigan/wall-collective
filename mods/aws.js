var AWS = require('aws-sdk'),
    secrets = require('../config/secrets.js'),
    accessKeyId =  process.env.AWS_ACCESS_KEY || secrets.s3accessKeyId,
    secretAccessKey = process.env.AWS_SECRET_KEY || secrets.s3secretAccessKey,
    s3;

AWS.config.update({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey
});

s3 = new AWS.S3();

module.exports = function () {

  return s3;

};
