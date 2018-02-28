const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin');

const paths = require('./paths');
const configFactory = require('./webpack.config');

const customFontPath = 'app/react/src/assets/fonts/';

const devConfig = {
  mode: 'development',

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
    // not working till we remove grunt-webpack
    // new webpack.HotModuleReplacementPlugin(),
    new HardSourceWebpackPlugin(),
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
      excludeAssets: [/(plateforme|app).*\/style.*.(css|js)/] // let's find a better way to handle style when we sign a new white label
    }),
    new HtmlWebpackExcludeAssetsPlugin(),
  ],

};

module.exports = merge(configFactory(false, customFontPath, false), devConfig);
