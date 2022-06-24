const webpack = require('webpack');
const path = require('path');
const paths = require('./paths');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const VersionPlugin = require('./VersionPlugin.js');
const ESLintPlugin = require('eslint-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  entry: {
    app: path.join(paths.reactAppSrc, '/index.tsx'),
    'style-less': paths.appStyleLess,
  },
  target: 'web',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'swc-loader',
        },
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

  optimization: {
    minimizer: [
      `...`, // need to keep this otherwise it doesn't minify js anymore
      new CssMinimizerPlugin(),
    ],
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'react-vendors',
          chunks: 'all',
        },
      },
    },
  },

  resolve: {
    alias: {
      Containers: path.resolve(__dirname, 'app/react/src/containers/'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },

  plugins: [
    new ESLintPlugin(),
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
