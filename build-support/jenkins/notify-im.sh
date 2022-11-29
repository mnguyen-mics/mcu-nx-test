#!/usr/bin/env bash

set -eu

# from https://wiki.jenkins.io/display/JENKINS/Git+Plugin#GitPlugin-Environmentvariables
range="${GIT_PREVIOUS_SUCCESSFUL_COMMIT}..${GIT_COMMIT}"

echo "Using range $range to compute commit authors / jira tickets"
count=$(git log --oneline "$range"|wc -l)
jira_tickets=$(git log --pretty=format:"%s" "$range"|egrep -o '^MICS-[0-9]+ '|sort|uniq)

# Find out lead and sidekick's names
allNames=$(git log --pretty=format:"%ae" --no-merges "$range" --reverse | cut -d '@' -f 1)
names=($(echo -e "${allNames}" | awk '!a[$0]++'))
# history -p "history => ${names[@]}"

# Set up lead and sidekick
if [ -n "${names[0]:-}" ]; then
    lead=${names[0]}
    echo "Notifying $lead (lead) of this failure"
fi

if [ -n "${names[1]:-}" ]; then
    sidekick=${names[1]}
    echo "Notifying $sidekick (sidekick) of this failure"
fi

# Build and send message
message="We have $count commits since the last successful build."

if [ -n "${lead:-}" ]; then message="$message <@${lead}> (lead)"; else message="$message. Devs"; fi
if [ -n "${sidekick:-}" ]; then message="$message and <@${sidekick}> (sidekick)"; fi

message="$message could you check the build please?"

if [[ -n "$jira_tickets" ]]; then
  message="$message The commits reference the jira tickets"
  for ticket in $jira_tickets; do
    message="$message <https://mediarithmics.atlassian.net/browse/${ticket}|${ticket}>"
  done
fi

echo "Full message: $message"

slack chat send \
  --title ":rotating_light: <${BUILD_URL:-}|The staging build failed>" \
  --text "$message" \
  --channel 'build-front' > /dev/null
