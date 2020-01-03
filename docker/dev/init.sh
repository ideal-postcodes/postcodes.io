#!/bin/bash
set -e

POSTGRES="psql --username ${POSTGRES_USER}"

echo "Creating database: ${PCIO_DB_NAME}"

$POSTGRES <<EOSQL
CREATE DATABASE ${PCIO_DB_NAME} OWNER ${POSTGRES_USER};
EOSQL
