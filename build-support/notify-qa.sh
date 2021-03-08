#!/usr/bin/env bash

set -eu

message="The cypress navigator pipeline E2E tests failed, <@UUDAEGJSX>, <@UNKHH0Z6D>, <@U01B7SL6160> could you please help identifying the cause of the failure"

slack chat send \
  --title ":rotating_light: <${BUILD_URL:-}|The staging build failed>" \
  --text "$message" \
  --channel 'jacks-parrot' > /dev/null