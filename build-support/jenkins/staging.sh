#!/usr/bin/env bash

source $HOME/.bashrc

./build-support/jenkins/common.sh

set -eu

VERSION=$1

REPOSITORY="staging"
GROUP_ID="com.mediarithmics.web"
ARTIFACT_ID="navigator"

mvn -q deploy:deploy-file \
  -DgroupId=${GROUP_ID} \
  -DartifactId=${ARTIFACT_ID} \
  -Dversion="${VERSION}" \
  -DgeneratePom=true \
  -Dpackaging=zip \
  -DrepositoryId=nexus \
  -Durl=https://sf-nexus.mediarithmics.com/repository/${REPOSITORY} \
  -Dfile=navigator.zip

echo '================================================'
echo 'Staging Build'
echo 'group_id : '$GROUP_ID
echo 'artifact_id : '$ARTIFACT_ID
echo 'version : '$VERSION
echo '================================================'