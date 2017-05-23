module.exports = {
  port: 8000,
  mainDir: __dirname.replace('/config', ''),

  // server-side settings
  useCDN: true, // use CDNs rather than local modules
  useIGram: true, // enable instagram integration

  // set directories
  imageDir: '/images/',
  staticImageDir: 'public/images',
  logDir: 'logs',

  // set up s3
  bucket: 'wall-collective2',

  // upload options
  uploadTo: {
    local: true,
    s3: true,
    cloudinary: false
  },

  // loadFrom: 'local',
  // loadFromLoc: '/images/',

 loadFrom: 's3',
 loadFromLoc: 'https://s3.amazonaws.com/wall-collective2/',

//  loadFrom: 'cloudinary',
// loadFromLoc: 'temp'

  // temporary holding spot for database
  backgroundColor: '#000000'

};
