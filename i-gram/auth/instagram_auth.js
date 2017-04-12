var request = require('request'),
    secrets = require('../config/secrets'),
    mongoose = require('mongoose'),
    InstaSessions;

require('../models/instagram-session');
InstaSessions = mongoose.model('insta_sessions');

// if this request is the callback from the instagram api...

// insta_step 2: Use authorization code from Instagram's API to get an access token

// If a user clicks on #instagram_login and authenticates their account,
// instagram redirects to "callback uri"
// with an authorization code in the form of a query parameter
// (e.g. http://www.wall-collective.com/?myclient_id=johndoe&code=xyzxyzxyz)
module.exports = function (req, res, next) {

  // if the authorization code is present...
  if (req.query.code) {
        // send a post to the instagram oauth api to receive an access token within another response.
        // insta_app_id and instagram_secret are supplied by by Instagram https://www.instagram.com/developer/clients/manage/

        // authorization code is taken from the url query parameter when a user authenticates
        // Important: redirect_uri must match entirely, including any query parameters.
    request.post(
      { form: { client_id     : secrets.insta_app_id,
                client_secret : secrets.instagram_secret,
                grant_type    : 'authorization_code',
                redirect_uri  : 'http://' + req.headers.host + '/?myclient_id=' + req.query.myclient_id,
                code          : req.query.code
              },
        url: 'https://api.instagram.com/oauth/access_token'
      },
    function (err, response, body) {
      var insta_access_data = JSON.parse(body);

      if (err) {
        console.log ('Error in post to https://api.instagram.com/oauth/access_token', err);
      } else {
        // if the response from the post is an error code...
        if (insta_access_data.code === 400) {
          console.log('Error response from https://api.instagram.com/oauth/access_token');
          console.log(insta_access_data.error_type + ': ' + insta_access_data.error_message);
        // else if the response is a success...
        } else {

          // insta_step 3: Store access token information in the database
          InstaSessions.update(
            { session_id : req.query.myclient_id },
            { $set: { inst_access_token     : insta_access_data.access_token,
                      insta_profile_picture : insta_access_data.user.profile_picture,
                      insta_full_name       : insta_access_data.user.full_name,
                      inst_username         : insta_access_data.user.username } },
            { upsert: true },
            function (err) { if (err) return console.error(err); } );

          // Perhaps use javascript to read ?open_instagram_div instead of passing variable to index?

          // insta_step 4: Reload the page with the open_instagram_div query parameter
          res.redirect(url.parse(req.url).pathname + '?open_instagram_div');
        }; // end of if else response for access token
      }; // end of if(err) for post
    }); // end of post callback
  } else {
    next();
  };

};
