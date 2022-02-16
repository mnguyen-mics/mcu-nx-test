#!/bin/sh

set -eu

# To make this work, use as follows, from the Git repository's root :
#    bash ./build-support/jenkins/generate-cypress-json.sh <virtual_platform_name> > ./Cypress/cypress.json
#
# This assumes that you are testing against a virtual platform.
# If you're not (for local tests for instance), don't give any localhost:900 will be used as the base url.

set +u
if [ "$#" -eq 3 ]; then
# used for running tests locally but using the backend of a vp, for cypress coverage.
  NAVIGATOR_URL="http://localhost:9000"
  API_URL="https://api."$1".mics-sandbox.com"
  EVENT_URL="https://events."$1".mics-sandbox.com"
  VIRTUAL_PLATFORM_NAME="$1"
  USER_NAME=""
  RECORD_VIDEO=false
  ROOT="https://auth."$1".mics-sandbox.com"
elif [ "$#" -eq 2 ]; then
# used for CI pipeline -> we don't record videos, and execute the tests against a sandbox.
  NAVIGATOR_URL="https://navigator."$1".mics-sandbox.com"
  API_URL="https://api."$1".mics-sandbox.com"
  EVENT_URL="https://events."$1".mics-sandbox.com"
  VIRTUAL_PLATFORM_NAME="$1"
  USER_NAME="$2"
  RECORD_VIDEO=false
  ROOT="https://auth."$1".mics-sandbox.com"
elif [ "$#" -eq 1 ]; then
# used for CI pipeline -> we don't record videos, and execute the tests against a sandbox.
  NAVIGATOR_URL="https://navigator."$1".mics-sandbox.com"
  API_URL="https://api."$1".mics-sandbox.com"
  EVENT_URL="https://events."$1".mics-sandbox.com"
  VIRTUAL_PLATFORM_NAME="$1"
  USER_NAME=""
  RECORD_VIDEO=false
  ROOT="https://auth."$1".mics-sandbox.com"
else
# dev mode, we record videos and use localhost:9000 as base url
  NAVIGATOR_URL="http://localhost:9000"
  API_URL="https://api.mediarithmics.local"
  EVENT_URL="https://events."$1".mics-sandbox.com"
  VIRTUAL_PLATFORM_NAME=""
  USER_NAME=""
  RECORD_VIDEO=true
  ROOT="https://auth.mediarithmics.local"
fi
RANDOM=$$
DEV_MAIL="dev@mediarithmics.com"
DEV_PWD='AH9zk3ekLzYse6MhCLQSpzoD64aqQdGPsBCLfDxy'
SNAPSHOTS_PORT=$(( ( RANDOM % 60000 )  + 5000 ))

set -u
cat << EOF
{
  "baseUrl": "${NAVIGATOR_URL}",
  "chromeWebSecurity": false,
  
  "testFiles": ["**/*.spec.js", "**/*.spec.ts"],
  "ignoreTestFiles": ["CreateJobExecution.spec.js", "EditAllReplicationFields.spec.js","Sites.spec.ts","DisplayLiveEventWithoutUserPoint.spec.ts","OnSegmentExit.spec.ts","DisplayCampaignResourceHistory.spec.ts","MobileApplication.spec.ts", "StandardSegmentBuilderLimits.spec.ts", "**/__snapshots__/*","**/__image_snapshots__/*"],


  "env": {
    "cypress-plugin-snapshots": {
      "serverPort": ${SNAPSHOTS_PORT},
      "imageConfig": {
      "threshold": 0.05,
      "thresholdType": "percent"
      }
    },
    "apiDomain": "${API_URL}",
    "eventDomain": "${EVENT_URL}",
    "devMail": "${DEV_MAIL}",
    "devPwd": "${DEV_PWD}",
    "virtualPlatformName":"${VIRTUAL_PLATFORM_NAME}",
    "userName":"${USER_NAME}",
    "root": "${ROOT}",
    "realm": "mediarithmics",
    "client_id":"mediarithmics-computing-console",
    "allure":true,
    "allureResultsPath":"allure-results",
    "allureAttachRequests":true,
    "allureOmitPreviousAttemptScreenshots":true
  },
  "retries": {
    "runMode": 4,
    "openMode": 1
  },
  "watchForFileChanges": false,

  "defaultCommandTimeout": 120000,
  "responseTimeout": 300000,
  "pageLoadTimeout": 120000,
  "execTimeout": 300000,

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
