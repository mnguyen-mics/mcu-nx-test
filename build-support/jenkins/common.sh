#!/usr/bin/env bash

set -eu
source ~/.bashrc

nvm use v18

npm ci
npm run lint
npm run prettier-check
npm run build