var fs = require('fs'),
    request = require('request');

// download helper function
module.exports = function (uri, filename, callback) {

  request.head(uri, function (err, res, body) {
    var r;

    if (err) { console.log(err); };

    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);
    console.log(body);

    r = request(uri).pipe(fs.createWriteStream(filename));
    r.on('close', callback);
  });
};
