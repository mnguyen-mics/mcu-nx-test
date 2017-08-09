const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const paths = require('./paths');
const configFactory = require('./webpack.config');

const customFontPath = 'app/react/src/assets/fonts/';

const devConfig = {

  devtool: 'eval',

  output: {
    filename: '[name].js',
    path: paths.appPath,
    publicPath: paths.publicPath,
  },

  node: {
    fs: 'empty',
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
    }),
  ],

};

module.exports = merge(configFactory(false, customFontPath, false), devConfig);
