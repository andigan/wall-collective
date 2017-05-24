module.exports = {
  port: 8000,
  mainDir: __dirname.replace('/config', ''),

  // server-side settings
  useCDN: true, // use CDNs rather than local modules
  useIGram: true, // enable Instagram integration

  // set directories
  staticImageDir: 'public/images',

  // set up s3
  bucket: 'wall-collective',

  // storage options
  storageOpt: {
    s3:         { save: true,  del: true,  loc: 'https://s3.amazonaws.com/wall-collective/' },
    local:      { save: false, del: false, loc: '/images/'},
    cloudinary: { save: false, del: false,  loc: 'temp' },
    log:        { save: true, loc: '/logs/' }
  },

  // choose url to save to DB
  UrlToDB: 's3',

  // reload option:
  reloadFrom: 'db',
  // reloadFrom: 's3',
  // reloadFrom: 'local',
  // reloadFrom: 'cloudinary',

  // temporary holding spot for database
  backgroundColor: '#000000'

};
