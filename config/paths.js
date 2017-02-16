const path = require('path');

function resolve(relativePath) {
  return path.resolve(relativePath);
}

module.exports = {
  appHtml: resolve('app/index.html'),
  reactAppSrc: resolve('app/react/src'),
  appNodeModules: resolve('node_modules'),
  appPath: resolve('app'),
  publicPath: '/'
};
