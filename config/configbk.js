module.exports = {
  port: 80,
  mainDir: __dirname.replace('/config', ''),

  useCDN: true, // use CDNs rather than local modules
  useIGram: true, // enable Instagram integration
  debug: false,

  // storage options
  storageOpt: {
    s3:         { save: true,  del: true,  loc: 'https://s3.amazonaws.com/wall-collective/' },
    local:      { save: true, del: true, loc: '/images/'},
    cloudinary: { save: false, del: false,  loc: 'temp' },
    log:        { save: true, loc: '/logs/' }
  },

  // set directories
  staticImageDir: 'public/images',

  // set up s3
  bucket: 'wall-collective',

  // choose url to save to DB
  UrlToDB: 's3', // s3, local, or cloudinary

  // reload option:
  reloadFrom: 'db', // db, s3, local, or cloudinary

  // initial dragger settings
  initialDraggers: 'SrObcgTP',

  // set upload placement
  uploadTop: '10%',
  uploadLeft: '10%',
  uploadWidth: '20%',
  uploadHeight: '20%',

  // set maximum limit for draggers
  blurLevel: 7,
  brightnessLevel: 8,
  contrastLevel: 10,
  saturateLevel: 10,

  // color chooser size in pixels
  chooserPos: { width: 180,
                height: 100 },

  // session string generator
  sessionStr: { length: 10,
                charset: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' },

  // filename string generator
  imageStr: { length: 6,
                charset: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' },

  // temporary holding spot for database
  backgroundColor: '#000000'
};
