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

  // temporary holding spot for database
  backgroundColor: '#000000'

};
