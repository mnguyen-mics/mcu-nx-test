const path = require('path');

function resolve(relativePath) {
  return path.resolve(relativePath);
}

module.exports = {
  appHtml: resolve('app/index.html'),
  appDistHtml: resolve('dist/index.html'),
  reactAppSrc: resolve('app/react/src'),
  appStyle: resolve('app/react/src/styles/index.scss'),
  appStyleLess: resolve('app/react/src/styles/index.less'),
  appGravityStyleLess: resolve('app/react/src/styles/plateforme.alliancegravity.com/index-gravity.less'),
  appConvergedStyleLess: resolve('app/react/src/styles/converged-ww2.havas.com/index-havas.less'),
  appTeamjoinStyleLess: resolve('app/react/src/styles/app.teamjoin.fr/index-teamjoin.less'),
  appValiuzStyleLess: resolve('app/react/src/styles/console.valiuz.com/index-valiuz.less'),
  appNodeModules: resolve('node_modules'),
  appPath: resolve('app'),
  appDistPath: resolve('dist/react'),
  publicPath: '/',
  publicDistPath: '/react',
  // appIndexJs: resolve('app/react/src/index.tsx'),
};
