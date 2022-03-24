const path = require('path');

function resolve(relativePath) {
  return path.resolve(relativePath);
}

module.exports = {
  appHtml: resolve('app/index.html'),
  appDistHtml: resolve('dist/index.html'),
  reactAppSrc: resolve('app/react/src'),
  appStyleLess: resolve('app/react/src/styles/index.less'),
  appConvergedStyleLess: resolve('app/react/src/styles/converged-ww2.havas.com/index-havas.less'),
  appValiuzStyleLess: resolve('app/react/src/styles/console.valiuz.com/index-valiuz.less'),
  appNodeModules: resolve('node_modules'),
  appPath: resolve('app'),
  appDistPath: resolve('dist/react'),
  publicPath: '/',
  publicDistPath: '/react',
};
