module.exports = {
  port: 8000,
  mainDir: __dirname.replace('/config', ''),

  // settings
  useCDN: true, // use CDNs rather than local modules
  useIGram: true, // enable instagram integration

  // set directories
  imageDir: '/images/',
  staticImageDir: 'public/images',
  logDir: 'logs'

};
