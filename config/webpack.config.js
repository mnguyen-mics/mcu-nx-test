const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const paths = require('./paths');
const pkg = require('../package.json');

const configFactory = (isProduction, customFontPath, lintFailOnError) => {
  return {
    entry: {
      app: path.join(paths.reactAppSrc, '/index.js'),
      'style-less': paths.appStyleLess,
      'react-vendors': Object.keys(pkg.dependencies),
    },

    module: {
      rules: [
        {
          test: /\.js$/,
          include: paths.reactAppSrc,
          use: {
            loader: 'eslint-loader',
            query: {
              failOnError: lintFailOnError,
            },
          },
          enforce: 'pre',
        },
        {
          test: /\.ts$/,
          include: paths.reactAppSrc,
          use: {
            loader: 'tslint-loader',
            query: {
              failOnError: lintFailOnError,
            },
          },
          enforce: 'pre',
        },
        {
          test: /\.jsx?$/,
          include: paths.reactAppSrc,
          loader: 'babel-loader',
        },
        {
          test: /\.tsx?$/,
          include: paths.reactAppSrc,
          use: ['babel-loader', 'ts-loader'],
        },
        {
          test: /\.less$/i,
          loader: ExtractTextPlugin.extract({
            use: ['css-loader', 'less-loader'],
          }),
        },
        {
          test: /\.css$/,
          use: [ 'style-loader', 'css-loader' ]
        },
        {
          test: /\.(jpe?g|png|gif|svg)$/i,
          use: [
            {
              loader: 'file-loader',
              query: {
                name: `${
                  isProduction ? '/src/assets/images/' : ''
                }[name].[ext]`,
              },
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
                },
              },
            },
          ],
        },
        {
          test: /\.(eot|ttf|woff(2)?)(\?v=\d+\.\d+\.\d+)?/,
          use: 'url-loader',
        },
      ],
    },

    resolve: {
      alias: {
        Containers: path.resolve(__dirname, 'app/react/src/containers/'),
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },

    plugins: [
      new ExtractTextPlugin('[name].css'),
      new webpack.DefinePlugin({
        PUBLIC_PATH: JSON.stringify('react'),
      }),
      new webpack.DefinePlugin({
        PUBLIC_URL: JSON.stringify('/v2'),
      }),
    ],
  };
};

module.exports = configFactory;
