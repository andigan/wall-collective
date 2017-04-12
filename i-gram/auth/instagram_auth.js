var request = require('request'),
    secrets = require('../config/secrets'),
    mongoose = require('mongoose'),
    url = require('url'),
    InstaSessions;

require('../db/models/instagram-session');
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
        // instaAppID and instaSecret are supplied by by Instagram https://www.instagram.com/developer/clients/manage/

        // authorization code is taken from the url query parameter when a user authenticates
        // Important: redirect_uri must match entirely, including any query parameters.
    request.post(
      { form: { client_id     : secrets.instaAppID,
                client_secret : secrets.instaSecret,
                grant_type    : 'authorization_code',
                redirect_uri  : 'http://' + req.headers.host + '/?myclient_id=' + req.query.myclient_id,
                code          : req.query.code
              },
        url: 'https://api.instagram.com/oauth/access_token'
      },
    function (err, response, body) {
      var instaAccessData = JSON.parse(body);

      if (err) {
        console.log ('Error in post to https://api.instagram.com/oauth/access_token', err);
      } else {
        // if the response from the post is an error code...
        if (instaAccessData.code === 400) {
          console.log('Error response from https://api.instagram.com/oauth/access_token');
          console.log(instaAccessData.error_type + ': ' + instaAccessData.error_message);
        // else if the response is a success...
        } else {

          // insta_step 3: Store access token information in the database
          InstaSessions.update(
            { session_id : req.query.myclient_id },
            { $set: { inst_access_token     : instaAccessData.access_token,
                      insta_profile_picture : instaAccessData.user.profile_picture,
                      insta_full_name       : instaAccessData.user.full_name,
                      inst_username         : instaAccessData.user.username } },
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
