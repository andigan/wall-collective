var dbConfig = require('../config/db-config'),
    mongoose = require('mongoose');

module.exports = {
  init: function () {

    this.connect();
    this.loadModels();
  },

  connect: function () {
    mongoose.connect(dbConfig.url);

    mongoose.connection.on('connected', function () {
      console.log('\nMongoose default connection open to ' + dbConfig.url + '\n');
    });

    mongoose.connection.on('error',function (err) {
      console.log('\nMongoose default connection error: ' + err + '\n');
    });

    mongoose.connection.on('disconnected', function () {
      console.log('\nMongoose default connection disconnected\n');
    });

    // If the Node process ends, close the Mongoose connection
    process.on('SIGINT', function () {
      mongoose.connection.close(function () {
        console.log('\nMongoose default connection disconnected through app termination.\n');
        process.exit(0);
      });
    });
  },

  loadModels: function () {
    require('./models/user');
    require('./models/image');
  }
};
