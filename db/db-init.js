module.exports = function () {
  var dbConfig = require('../config/db-config'),
      mongoose = require('mongoose');

  mongoose.connect(dbConfig.url);

  mongoose.connection.on('connected', function () {
    console.log('Mongoose default connection open to ' + dbConfig.url);
  });

  mongoose.connection.on('error',function (err) {
    console.log('Mongoose default connection error: ' + err);
  });

  mongoose.connection.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
  });

  // If the Node process ends, close the Mongoose connection
  process.on('SIGINT', function () {
    mongoose.connection.close(function () {
      console.log('Mongoose default connection disconnected through app termination');
      process.exit(0);
    });
  });

  // create models
  require('./models/user');
  require('./models/image');
};
