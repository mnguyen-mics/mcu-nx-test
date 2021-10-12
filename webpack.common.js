const webpack = require('webpack');
const path = require('path');
const pkg = require('./package.json');
const paths = require('./paths');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const VersionPlugin = require('./VersionPlugin.js');

module.exports = {
  entry: {
    app: path.join(paths.reactAppSrc, '/index.tsx'),
    'style-less': paths.appStyleLess,
    'react-vendors': Object.keys(pkg.dependencies),
  },
  target: 'web',
  module: {
    rules: [
      {
        test: /\.js$/,
        include: paths.reactAppSrc,
        use: {
          loader: 'eslint-loader',
          options: {
            failOnError: true,
          },
        },
        enforce: 'pre',
      },
      {
        test: /\.tsx?$/,
        include: paths.reactAppSrc,
        use: {
          loader: 'tslint-loader',
          options: {
            failOnError: true,
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
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'less-loader',
            options: {
              javascriptEnabled: true,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: `${true ? '/src/assets/images/' : ''}[name].[ext]`,
            },
          },
          {
            loader: 'image-webpack-loader',
            options: {
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
    new VersionPlugin({ path: path.resolve('app') }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new webpack.DefinePlugin({
      PUBLIC_PATH: JSON.stringify('react'),
      PUBLIC_URL: JSON.stringify('/v2'),
    }),
  ],
};
