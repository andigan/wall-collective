getContent = require('../../adapters/native-get');
instaOptions = require('../config/fetch-options');

module.exports = {
  fetchInstaData: function (access_token) {
    // use the client_id's access_token (insta_step 3) to get an endpoint from Instagram...
    return getContent(instaOptions.url + access_token + '&count=' + instaOptions.count)
      .then(function (result) {

        var insta_endpoint_response = JSON.parse(result),
            results = {
              username: insta_endpoint_response.data[0].user.username,
              profile_picture: insta_endpoint_response.data[0].user.profile_picture,
              insta_images_src: [],
              insta_images_link: []
            };

        // insta_step 8: Populate results object to pass to client
        // for each object in the endpoint response object, add url to insta_images_src
        for (i = 0; i < insta_endpoint_response.data.length; i++ ) {
          if (insta_endpoint_response.data[i].type === 'image') {
            results.insta_images_src.push(insta_endpoint_response.data[i].images.standard_resolution.url);
            results.insta_images_link.push(insta_endpoint_response.data[i].link);
          };
        };

        return results;
      }).catch(function (err) {
        console.error(err);
      });
  }
};
