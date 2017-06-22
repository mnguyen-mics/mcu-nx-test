const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const paths = require('./paths');
const babelOptions = require('./babel');
const pkg = require('../package.json');

const extractStyle = new ExtractTextPlugin({
  filename: '[name].[chunkhash].css',
  disable: process.env.NODE_ENV === 'development'
});

const configFactory = (isProduction, customFontPath, eslintFailOnError) => {

  return {

    entry: {
      app: path.join(paths.reactAppSrc, '/index.js'),
      'style-less': paths.appStyleLess,
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
          test: /\.js$/,
          include: paths.reactAppSrc,
          use: {
            loader: 'babel-loader',
            options: babelOptions
          }
        },
        {
          test: /\.less$/,
          loader: extractStyle.extract({
            use: [
              'css-loader?sourceMap',
              'less-loader'
            ]
          })
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
      modules: [paths.appNodeModules]
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
