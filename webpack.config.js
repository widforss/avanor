const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: './client/main.js',
  output: {
    path: __dirname,
    filename: 'client.js'
  },
  optimization: {
    minimizer: [new TerserPlugin()]
  },
};
