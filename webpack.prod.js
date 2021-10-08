const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
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
    filename: '[name].[hash].js',
    path: paths.appDistPath,
    publicPath: paths.publicDistPath,
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: paths.reactAppSrc,
        use: ['babel-loader', 'ts-loader'],
      },
    ],
  },

  plugins: [
    new CopyWebpackPlugin([
      { from: './app/*.html', to: '../[name].[ext]' },
      { from: './app/*.txt', to: '../[name].[ext]' },
      { from: './app/*.json', to: '../[name].[ext]' },
      {
        from: 'app/react/src/assets',
        to: 'src/assets',
      },
    ]),
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
      filename: '../index.html',
      excludeChunks: [
        'plateforme.alliancegravity.com/style-less',
        'converged-ww2.havas.com/style-less',
        'app.teamjoin.fr/style-less',
        'console.valiuz.com/style-less',
      ],
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.API_ENV': JSON.stringify(process.env.API_ENV),
    }),
  ],
});
