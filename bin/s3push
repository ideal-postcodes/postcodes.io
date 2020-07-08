#!/usr/bin/env bash

# Uploads pg_dump to postcodes.io s3
# $ ./s3push postcodes.io.dump.sql.gz

set -o errexit

if ! [ -x "$(command -v s3cmd)" ]; then
  echo 'Error: s3cmd is not installed.' >&2
  exit 1
fi

S3_BUCKET_NAME="postcodesio"
S3_BUCKET_PATH="public"

s3cmd put --acl-public $1 s3://$S3_BUCKET_NAME/$S3_BUCKET_PATH/
