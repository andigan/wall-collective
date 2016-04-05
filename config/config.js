var config = {};

// set port
config.port = 8000;

// set mongoDB database
config.database_name = 'mydatabase';
config.collection_name = 'mycollection';
// set use_cdn to use CDNs rather than local modules
config.use_cdn = true;

// set directories
config.image_dir        = '/images/';
config.static_image_dir = 'public/images';
config.logdir           = 'logs';

module.exports = config;
