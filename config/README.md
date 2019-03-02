# Postcodes.io Configuration

## Overview

Postcodes.io accepts configurations from environment variables and the .env file in the root directory.

Environment variable configuration takes precedence.

Default configuration values can be found at `config/config.js` and `config/defaults.js`.

## Configuration Options

```bash
PORT # Port to listen on

MAPBOX_PUBLIC_KEY # Mapbox key if you wish to use `/explore` functionality

POSTGRES_USER # Postgres user
POSTGRES_PASSWORD # Postgres password
POSTGRES_DATABASE # Postgres database name
POSTGRES_HOST # Postgres host
POSTGRES_PORT # Postgres port

LOG_NAME # Name attached to JSON log output
LOG_DESTINATION # Log destination, can be set to file `LOG_DESTINATION=/var/logs/pcio.log` or `stdout` or `perf` (high performance stdout)
```
