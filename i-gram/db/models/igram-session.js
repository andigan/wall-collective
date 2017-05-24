var mongoose = require('mongoose'),

    IgramSessionsSchema = new mongoose.Schema({
      session_id: String,
      igram_username: String,
      igram_token: String,
      igram_profile_pic: String,
      igram_full_name: String

    });

module.exports = mongoose.model('igram_sessions', IgramSessionsSchema);
