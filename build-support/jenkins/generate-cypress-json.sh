#!/bin/sh

set -eu

# To make this work, use as follows, from the Git repository's root :
#    bash ./build-support/jenkins/generate-cypress-json.sh <virtual_platform_name> > ./Cypress/cypress.json
#
# This assumes that you are testing against a virtual platform.
# If you're not (for local tests for instance), don't give any localhost:900 will be used as the base url.

set +u
if [ "$#" -eq 2 ]; then
# used for CI pipeline -> we don't record videos, and execute the tests against a sandbox.
  NAVIGATOR_URL="https://navigator."$1".mics-sandbox.com"
  API_URL="https://api."$1".mics-sandbox.com"
  VIRTUAL_PLATFORM_NAME="$1"
  USER_NAME="$2"
  RECORD_VIDEO=false
elif [ "$#" -eq 1 ]; then
# used for CI pipeline -> we don't record videos, and execute the tests against a sandbox.
  NAVIGATOR_URL="https://navigator."$1".mics-sandbox.com"
  API_URL="https://api."$1".mics-sandbox.com"
  VIRTUAL_PLATFORM_NAME="$1"
  USER_NAME=""
  RECORD_VIDEO=false
else
# dev mode, we record videos and use localhost:9000 as base url
  NAVIGATOR_URL="http://localhost:9000"
  API_URL="https://api.mediarithmics.local"
  VIRTUAL_PLATFORM_NAME=""
  USER_NAME=""
  RECORD_VIDEO=true
fi

DEV_MAIL="dev@mediarithmics.com"
DEV_PWD='k&JXpQeQK6Ra#$49kLFM5A5CD3RFXM7NX9ir$aJrz4JzGYbtz8'

set -u
cat << EOF
{
  "baseUrl": "${NAVIGATOR_URL}",
  
  "testFiles": ["**/*.spec.js", "**/*.spec.ts"],
  "ignoreTestFiles": ["CreateJobExecution.spec.js", "EditAllReplicationFields.spec.js","Sites.spec.ts","DisplayLiveEventWithoutUserPoint.spec.ts","OnSegmentExit.spec.ts","DisplayCampaignResourceHistory.spec.ts","MobileApplication.spec.ts"],


  "env": {
    "apiDomain": "${API_URL}",
    "devMail": "${DEV_MAIL}",
    "devPwd": "${DEV_PWD}",
    "virtualPlatformName":"${VIRTUAL_PLATFORM_NAME}",
    "userName":"${USER_NAME}"
  },
  "retries": {
    "runMode": 2,
    "openMode": 1
  },
  "watchForFileChanges": false,

  "defaultCommandTimeout": 15000,
  "responseTimeout": 300000,

  "video": ${RECORD_VIDEO},
  "viewportHeight": 1080,
  "viewportWidth": 1920,
  "projectId":"px499y",
  "reporter": "mochawesome",
  "reporterOptions": {
    "overwrite": false,
    "html": false,
    "json": true
  }
}
EOF
