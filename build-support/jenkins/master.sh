#!/usr/bin/env bash

set -eux
./build-support/jenkins/common.sh

VERSION=$1

REPOSITORY="releases"
GROUP_ID="com.mediarithmics.web"
ARTIFACT_ID="navigator"

mvn -q deploy:deploy-file \
  -DgroupId=${GROUP_ID} \
  -DartifactId=${ARTIFACT_ID} \
  -Dversion="${VERSION}" \
  -DgeneratePom=true \
  -Dpackaging=zip \
  -DrepositoryId=nexus \
  -Durl=https://sf-nexus.mediarithmics.com/content/repositories/${REPOSITORY} \
  -Dfile=navigator.zip

echo '================================================'
echo 'Master Build'
echo 'group_id : '$GROUP_ID
echo 'artifact_id : '$ARTIFACT_ID
echo 'version : '$VERSION
echo '================================================'