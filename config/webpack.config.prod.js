const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

const paths = require('./paths');
const configFactory = require('./webpack.config');

const customFontPath = `${paths.public}/src/assets/fonts/`;

const prodConfig = {
  mode: 'production',

  output: {
    filename: '[name].[chunkhash].js',
    path: paths.appDistPath,
    publicPath: paths.publicDistPath,
  },

  node: {
    fs: 'empty',
  },

  plugins: [
    new HardSourceWebpackPlugin(),
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appDistHtml,
      filename: '../index.html',
      excludeAssets: [/(plateforme|app).*\/style.*.(css|js)/] // let's find a better way to handle style when we sign a new white label
    }),
    new HtmlWebpackExcludeAssetsPlugin(),    
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    new CopyWebpackPlugin([
      {
        from: 'app/react/src/assets',
        to: 'src/assets',
      },
    ]),
  ],

};

module.exports = merge(configFactory(true, customFontPath, true), prodConfig);
