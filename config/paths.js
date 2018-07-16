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
  appTeamjoinStyleLess: resolve('app/react/src/styles/app.teamjoin.fr/index-teamjoin.less'),
  appNodeModules: resolve('node_modules'),
  appPath: resolve('app'),
  appDistPath: resolve('dist/react'),
  publicPath: '/',
  publicDistPath: '/react',
  appIndexJs: resolve('app/react/src/index.tsx'),
};
