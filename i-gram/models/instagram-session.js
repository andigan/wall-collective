var mongoose = require('mongoose'),

    InstaSessionSchema = new mongoose.Schema({
      session_id: String,
      inst_username: String,
      inst_access_token: String,
      insta_profile_picture: String,
      insta_full_name: String

    });

module.exports = mongoose.model('insta_sessions', InstaSessionSchema);
