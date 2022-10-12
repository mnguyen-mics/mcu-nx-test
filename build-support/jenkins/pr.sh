#!/usr/bin/env bash

set -eu

echo "Running gitlint"
git_range="origin/${ghprbTargetBranch:-master}..${ghprbActualCommit:-HEAD}"
gitlint --commits "$git_range"

./build-support/jenkins/common.sh