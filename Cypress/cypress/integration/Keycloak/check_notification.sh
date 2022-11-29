#!/bin/bash
email=$1
text_file=$(find /tmp/notification-center/emails/${email}/ -mmin -1 -iname "text.txt"|tail -1)
set -e
grep "reset your password" ${text_file} > /dev/null
grep "https:" ${text_file} > /dev/null


