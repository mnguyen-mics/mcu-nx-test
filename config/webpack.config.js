const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const paths = require('./paths');
const pkg = require('../package.json');

const extractStyle = new ExtractTextPlugin({
  filename: '[name].css',
  disable: process.env.NODE_ENV === 'development'
});

const configFactory = (isProduction, customFontPath, eslintFailOnError) => {

  return {

    entry: {
      app: path.join(paths.reactAppSrc, '/index.js'),
      'style-less': paths.appStyleLess,
      'plateforme.alliancegravity.com/style-less': paths.appGravityStyleLess,
      'react-vendors': Object.keys(pkg.dependencies)
    },

    module: {
      rules: [
        {
          test: /\.js$/,
          include: paths.reactAppSrc,
          use: {
            loader: 'eslint-loader',
            query: {
              failOnError: eslintFailOnError
            }
          },
          enforce: 'pre'
        },
        {
          test: /\.ts$/,
          include: paths.reactAppSrc,
          enforce: 'pre',
          loader: 'tslint-loader'
        },
        {
          test: /\.jsx?$/,
          include: paths.reactAppSrc,
          loader: 'babel-loader'
          // use: {
          //   loader: 'babel-loader',
          //   options: babelOptions
          // }
        },
        {
          test: /\.tsx?$/,
          include: paths.reactAppSrc,
          use: ['babel-loader', 'awesome-typescript-loader']
        },
        // {
        //   enforce: 'pre',
        //   test: /\.js$/,
        //   loader: 'source-map-loader'
        // },
        {
          test: /\.less$/,
          loader: extractStyle.extract({
            use: [
              'css-loader?sourceMap',
              'less-loader?sourceMap'
            ]
          }),
          include: [paths.appStyleLess, paths.appGravityStyleLess],
          // include: [
          //   path.appStyleLessDir,
          //   path.appStyleLess,
          // ],
          // exclude: path.appGravityStyleLess,
        },
        {
          test: /\.(jpe?g|png|gif|svg)$/i,
          use: [
            {
              loader: 'file-loader',
              query: {
                name: `${isProduction ? '/src/assets/images/' : ''}[name].[ext]`
              }
            },
            {
              loader: 'image-webpack-loader',
              query: {
                bypassOnDebug: true,
                gifsicle: {
                  interlaced: false,
                },
                optipng: {
                  optimizationLevel: 7,
                }
              }
            }
          ]
        },
        {
          test: /\.(eot|ttf|woff(2)?)(\?v=\d+\.\d+\.\d+)?/,
          use: 'url-loader'
        }
      ]
    },

    resolve: {
      alias: {
        Containers: path.resolve(__dirname, 'app/react/src/containers/')
      },
      modules: [paths.appNodeModules],
      extensions: ['.ts', '.tsx', '.js', '.jsx']
    },

    plugins: [
      extractStyle,
      new webpack.DefinePlugin({
        PUBLIC_PATH: JSON.stringify('react')
      }),
      new webpack.DefinePlugin({
        PUBLIC_URL: JSON.stringify('/v2')
      }),
      new webpack.optimize.CommonsChunkPlugin({
        names: ['react-vendors', 'manifest']
      })
    ]
  };

};

module.exports = configFactory;
