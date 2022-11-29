// http://antontelesh.github.io/testing/2019/02/04/mochawesome-merge.html

const cypress = require('cypress');
const fse = require('fs-extra');
const { merge } = require('mochawesome-merge');
const generator = require('mochawesome-report-generator');

async function runTests() {
  await fse.emptyDir('mochawesome-report'); // empty the report folder
  const customBrowser = process.env.npm_config_browser || 'electron';
  const { totalFailed } = await cypress.run({
    browser: customBrowser,
    headless: true,
  }); // get the number of failed tests
  const jsonReport = await merge(); // generate JSON report
  await generator.create(jsonReport);
  process.exit(totalFailed); // exit with the number of failed tests
}

runTests();
