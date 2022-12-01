const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const nrwlConfig = require('@nrwl/react/plugins/webpack.js');

module.exports = (config, context) => {
  nrwlConfig(config);
  return merge(config, common, {
    devtool: 'source-map',
  });
};
