#!/usr/bin/env bash

source $HOME/.bashrc

nvm use 18

set -u

npm ci --legacy-peer-deps
npm run lint
npm run prettier-check
npm run build