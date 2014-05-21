#!/bin/sh

if (( $# != 1 ))
then
  echo "Usage: "
  echo "  sh start.sh <server> : server to start, \"main\" or \"site\""
  exit 1
fi

./node_modules/.bin/supervisor node server/js/$1.js

