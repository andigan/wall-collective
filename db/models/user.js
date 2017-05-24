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
      igram_username: String,
      igram_token: String,
      igram_profile_pic: String,
      igram_full_name: String,
      session_id: String

    });

module.exports = mongoose.model('users', UserSchema);
