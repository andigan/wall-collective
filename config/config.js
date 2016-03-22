var config = {};

// set port
config.port = 8000;

// set mongDB database
config.database_name = 'max';

// set use_cdn to use cdns rather than local modules
config.use_cdn = false;

// set image directories
config.logdir              = 'logs/filelog';
// NOTICE: config.publicimagedir can only accept one directory path, e.g. 'public/onenameonly'
config.publicimagedir      = 'public/art';

// ignore
config.slashimagedirslash  = '/' + config.publicimagedir.split('/')[1] + '/';

module.exports = config;
