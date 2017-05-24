var config = require('../config/config'),
    fs = require('fs'),
    path = require('path');

module.exports = {

  removeFile(filename) {
    let file = path.join(config.mainDir, config.staticImageDir, filename);

    fs.access(file, fs.constants.R_OK | fs.constants.W_OK, (err) => {
      if (err) {
        console.log(`${file} not found.`);
      } else {

        // remove from file system
        fs.unlink(file, function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log('Deleted: ' + filename + '\n');
          };
        });

      };
    });
  }

};
