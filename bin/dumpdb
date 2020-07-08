#!/usr/bin/env bash

# Dumps postcodes.io db
# $ POSTGRSE_DB=postcodesiodb ./dumpdb.sh 

set -o errexit

if ! [ -x "$(command -v pg_dump)" ]; then
  echo 'Error: pg_dump is not installed.' >&2
  exit 1
fi

if ! [ -x "$(command -v gzip)" ]; then
  echo 'Error: gzip is not installed.' >&2
  exit 1
fi

if [ -z "$POSTGRES_DB" ]; then
  echo 'Database name must be specified.' >&2
  echo 'e.g. POSTGRES_DB=postcodesiodb ./dumpdb.sh' >&2
  exit 1
fi

if [ -z "$POSTGRES_HOST" ]; then
  echo 'Database name must be specified.' >&2
  echo 'e.g. POSTGRES_HOST=0.0.0.0 ./dumpdb.sh' >&2
  exit 1
fi

if [ -z "$POSTGRES_USER" ]; then
  echo 'Database name must be specified.' >&2
  echo 'e.g. POSTGRES_USER=user ./dumpdb.sh' >&2
  exit 1
fi

TIMESTAMP=`date +%F-%H%M`

# Create backup
pg_dump --no-owner --format=plain --host=$POSTGRES_HOST --username=$POSTGRES_USER $POSTGRES_DB | gzip > postcodesio-$TIMESTAMP.sql.gz

