const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const merge = require('webpack-merge');

const common = {
  entry: './src/index.js',
  output: {
    filename: './public/js/bundle.js'
  },
  plugins: [
    // environmental variables to pass to client, e.g. process.env.API_URL
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      }
    }),
    new ExtractTextPlugin('./public/css/styles.css')
  ],

  module: {
    rules: [
      {
        // js and jsx
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      // scss
      {
        test: /\.scss|.css$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  }
};


module.exports = function () {
  switch (process.env.NODE_ENV) {

    case 'development':
      return merge(
        common,
        { devtool: 'eval' }
      );
      break;

    case 'production':
    default:

      return merge(
        common,
        { devtool: 'eval' }
      );
      break;
  }
}();
