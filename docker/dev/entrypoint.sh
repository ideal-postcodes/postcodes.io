#!/bin/bash
set -euo pipefail

if [[ "$1" == test ]]; then
  dockerize -wait tcp://pg:5432 -timeout 120s
  npm test
  exit
fi

if [[ "$1" == tail ]]; then
  touch /app/test.log
  tail -f /app/test.log
  exit
fi

exec "$@"
