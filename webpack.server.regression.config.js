const webpack = require('webpack');

const config = require('./webpack.server.base.config');

config.plugins.push(
  new webpack.NormalModuleReplacementPlugin(
    /environment\.ts/,
    'environment.regression.ts'
  )
);

module.exports = config;
