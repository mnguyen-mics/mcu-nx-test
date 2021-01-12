const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackSkipAssetsPlugin = require('html-webpack-skip-assets-plugin').HtmlWebpackSkipAssetsPlugin;
const SriPlugin = require('webpack-subresource-integrity');

const paths = require('./paths');

module.exports = merge(common, {
  mode: 'production',

  entry: {
    'plateforme.alliancegravity.com/style-less': paths.appGravityStyleLess,
    'converged-ww2.havas.com/style-less': paths.appConvergedStyleLess,
    'app.teamjoin.fr/style-less': paths.appTeamjoinStyleLess,
    'console.valiuz.com/style-less': paths.appValiuzStyleLess,
  },

  output: {
    filename: '[name].[chunkhash].js',
    path: paths.appDistPath,
    publicPath: paths.publicDistPath,
  },

  node: {
    fs: 'empty',
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: paths.reactAppSrc,
        use: ['babel-loader', 'ts-loader'],
      },
    ]
  },

  plugins: [
    new CopyWebpackPlugin([
      { from: './app/*.html', to: '../[name].[ext]' },
      { from: './app/*.txt', to: '../[name].[ext]' },
      { from: './app/*.json', to: '../[name].[ext]' },
      { from: './app/.htaccess', to: '../[name].[ext]' },
      {
        from: 'app/react/src/assets',
        to: 'src/assets',
      },
    ]),
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
      filename: '../index.html',
      excludeAssets: [/(plateforme|app|console|converged-ww2).*\/style.*.(css|js)/],
    }),
    new SriPlugin({
      hashFuncNames: ['sha256', 'sha384'],
      enabled: process.env.NODE_ENV === 'production', // double check to ensure that we are in production env
    }),
    new HtmlWebpackSkipAssetsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
  ],
});