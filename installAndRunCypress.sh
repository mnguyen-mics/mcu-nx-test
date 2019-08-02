#!/usr/bin/env bash

npm install cypress --save-dev

CYPRESS_baseUrl=https://navigator.dreamy-hugle.mics-sandbox.com node_modules/cypress/bin/cypress run
