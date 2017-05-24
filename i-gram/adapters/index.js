getContent = require('../../adapters/native-get');
igramConfig = require('../config/igram-config');

module.exports = {
  // igram-#8: Use the session's accessToken (-#3) to get an endpoint from Igram...
  fetchIgramData: function (accessToken) {

    return getContent(igramConfig.url + accessToken + '&count=' + igramConfig.count)
      .then(function (result) {

        let endpointResponse = JSON.parse(result),
            results = {};

        // igram-#9: Parse the results into a return object
        results.username = endpointResponse.data[0].user.username;
        results.profilePic = endpointResponse.data[0].user.profile_picture;

        results.images = endpointResponse.data.filter(function (obj) {
          return (obj.type === 'image');

        }).map(function (obj) {

          return { url : obj.images.standard_resolution.url, pageLink : obj.link };

        });

        return results; // (-#10)
      }).catch(function (err) {
        console.error(err);
      });
  }
};
