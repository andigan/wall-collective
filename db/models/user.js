var mongoose = require('mongoose'),

    UserSchema = new mongoose.Schema({
      facebookid: String,
      googleId: String,
      username: String,
      firstName: String,
      lastName: String,
      pictureUrl: String,
      email: String,
      fbAccessToken: String,
      googleAccessToken: String,
      lastUpdate: String,
      strategy: String,
      inst_username: String,
      inst_access_token: String,
      insta_profile_picture: String,
      insta_full_name: String,
      session_id: String

    });

module.exports = mongoose.model('users', UserSchema);
