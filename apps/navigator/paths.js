const path = require('path');

function resolve(relativePath) {
  return path.resolve(relativePath);
}

module.exports = {
  appHtml: resolve('apps/navigator/index.html'),
  appDistHtml: resolve('dist/apps/navigator/index.html'),
  reactAppSrc: resolve('apps/navigator/src'),
  appStyleLess: resolve('apps/navigator/src/styles/index.less'),
  appConvergedStyleLess: resolve('apps/navigator/src/styles/converged-ww2.havas.com/index-havas.less'),
  appValiuzStyleLess: resolve('apps/navigator/src/styles/console.valiuz.com/index-valiuz.less'),
  appNodeModules: resolve('node_modules'),
  appPath: resolve('apps/navigator'),
  appDistPath: resolve('dist/apps/navigator/'),
  publicPath: '/',
  publicDistPath: '/react',
};
