#!/usr/bin/env bash

set -eu

source ~/.bashrc

VERSION="1.0.$(date +%Y%m%d)-build-${BUILD_NUMBER:-DEV}-rev-$(git rev-parse --short HEAD)"
REPOSITORY="releases"
GROUP_ID="com.mediarithmics.web"
ARTIFACT_ID="navigator"

case ${1:-} in
  --beta)
    ARTIFACT_ID="navigator-beta"
    ;;
esac


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
echo 'group_id : '$GROUP_ID
echo 'artifact_id : '$ARTIFACT_ID
echo 'version : '$VERSION
echo '================================================'
