#!/usr/bin/env bash

source ~/.bashrc

set -eu

# fuck js and all this fracking madness
rm -rf ./node_modules

nvm use v8.6.0

npm install

npm run test:lint
npm run i18n
#npm test

grunt clean

node --max_old_space_size=8000 `which grunt` build
