var request = require('request'),
    secrets = require('../config/secrets'),
    mongoose = require('mongoose'),
    url = require('url'),
    IgramSessions;

require('../db/models/igram-session');
IgramSessions = mongoose.model('igram_sessions');

// igram-#3: This middleware is applied in the main app.js filename
// After the user clicks the upload button, and authenticates their account,
// Igram redirects to "callback uri"
// with an authorization code in the form of a query parameter
// (e.g. http://www.wall-collective.com/?myclient_id=johndoe&code=xyzxyzxyz)
module.exports = function (req, res, next) {

  // if the authorization code is present...
  if (req.query.code) {
        // send a post to the igram oauth api to receive an access token within another response.
        // igramAppID and igramSecret are supplied by Igram
        // @ https://www.instagram.com/developer/clients/manage/

        // Important: redirect_uri must match what's supplied to Igram entirely, including any query parameters.
    request.post(
      { form: { client_id     : secrets.igramAppID,
                client_secret : secrets.igramSecret,
                grant_type    : 'authorization_code',
                redirect_uri  : 'http://' + req.headers.host + '/?myclient_id=' + req.query.myclient_id,
                code          : req.query.code
              },
        url: 'https://api.instagram.com/oauth/access_token'
      },
    function (err, response, body) {
      var igramResponse = JSON.parse(body);

      if (err) {
        console.log ('Error in post to https://api.instagram.com/oauth/access_token', err);
      } else {
        // if the response from the post is an error code...
        if (igramResponse.code === 400) {
          console.log('Error response from https://api.instagram.com/oauth/access_token');
          console.log(igramResponse.error_type + ': ' + igramResponse.error_message);
        // else if the response is a success...
        } else {

          // igram-#4: Store access token and account info in the session database
          IgramSessions.update(
            { session_id : req.query.myclient_id },
            { $set: { igram_token     : igramResponse.access_token,
                      igram_profile_pic : igramResponse.user.profile_picture,
                      igram_full_name       : igramResponse.user.full_name,
                      igram_username         : igramResponse.user.username } },
            { upsert: true },
            function (err) { if (err) return console.error(err); } );

          // igram-#5: Reload the window with the open_igram query parameter
          res.redirect(url.parse(req.url).pathname + '?open_igram'); // (-#6)
        };
      };
    });
  // if the authorization code is not present, proceed with routing
  } else {
    next();
  };
};
