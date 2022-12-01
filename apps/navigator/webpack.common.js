const webpack = require('webpack');
const VersionPlugin = require('./VersionPlugin');
const path = require('path');
const paths = require('./paths');

module.exports = {
  module: {
    rules: [
      {
        test: /\.[tj]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'swc-loader',
          options: {
            parseMap: true,
          },
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.API_ENV': JSON.stringify(process.env.API_ENV),
    }),
    new VersionPlugin({ path: path.resolve(paths.appPath) }),
  ],
};
