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
    local:      { save: true, del: true, loc: '/images/'},
    cloudinary: { save: false, del: false,  loc: 'temp' },
    log:        { save: true, loc: '/logs/' }
  },

  // choose url to save to DB
  UrlToDB: 's3',
  // UrlToDB: 'local',
  // UrlToDB: 'cloudinary',

  // reload option:
  reloadFrom: 'db',
  // reloadFrom: 's3',
  // reloadFrom: 'local',
  // reloadFrom: 'cloudinary',

  sessionStr: {
    length: 10,
    charset: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  },

  imageStr: {
    length: 6,
    charset: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  },

  // temporary holding spot for database
  backgroundColor: '#000000'

};
