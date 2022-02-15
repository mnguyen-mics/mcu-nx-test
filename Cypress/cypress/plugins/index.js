/// <reference types="@shelex/cypress-allure-plugin" />
const wp = require('@cypress/webpack-preprocessor');
const { initPlugin } = require('cypress-plugin-snapshots/plugin');
const allureWriter = require('@shelex/cypress-allure-plugin/writer');
// import allureWriter from "@shelex/cypress-allure-plugin/writer";

module.exports = (on, config) => {
  const options = {
    webpackOptions: require('../../webpack.config'),
  };
  require('@cypress/code-coverage/task')(on, config);
  initPlugin(on, config);

  on('file:preprocessor', wp(options));
  allureWriter(on, config);
  return config;
};
