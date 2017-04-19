module.exports = {
  entry: './src/index.js',
  output: {
    filename: './public/js/bundle.js'
  },
  module: {
    loaders: [ {
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: { presets: ['es2015', 'stage-2'] }
    } ]
  }
};
