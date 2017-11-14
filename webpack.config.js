const path = require('path');
const webpack = require('webpack');
const HtmlPlugin = require('html-webpack-plugin');
const SOURCE_DIR = path.resolve(__dirname, 'client');
const DESTINATION_DIR = path.resolve(__dirname, 'public/js');

module.exports = {
  context: SOURCE_DIR,
  entry: {
    app: './js/index.js',
    test: './js/test.js',
  },
  output: {
    filename: '[name].[hash].js',
    path: DESTINATION_DIR,
  },
  module: {
    rules: []
  },
  plugins: [
    new HtmlPlugin({
      filename: 'index.njk',
      template: 'index.njk',
      chunks: ['app'],
      env: 'NODE_ENV',
    }),
    new HtmlPlugin({
      filename: 'test.njk',
      template: 'test.njk',
      chunks: ['test'],
      env: 'NODE_ENV',
    }),
  ]
};
