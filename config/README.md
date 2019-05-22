# Postcodes.io Configuration

## Overview

Postcodes.io accepts configurations from environment variables and the .env file in the root directory.

Environment variable configuration takes precedence.

Default configuration values can be found at `config/config.js` and `config/defaults.js`.

## Configuration Options

```bash
# HTTP
PORT # Port to listen on
SERVE_STATIC_ASSETS # Set to `false` to prevent `public/` from being served

# JSON string to set arbitrary headers on all HTTP responses
# String must be valid JSON object. E.g. HTTP_HEADERS='{"foo":"bar"}'
HTTP_HEADERS 

# Postgresl Configuration
POSTGRES_USER # Postgres user
POSTGRES_PASSWORD # Postgres password
POSTGRES_DATABASE # Postgres database name
POSTGRES_HOST # Postgres host
POSTGRES_PORT # Postgres port

# Logging
LOG_NAME # Name attached to JSON log output
LOG_DESTINATION # Log destination, can be set to file `LOG_DESTINATION=/var/logs/pcio.log` or `stdout` or `perf` (high performance stdout)

# Google analytics key
GA_KEY

# Mapbox key if you wish to use `/explore` functionality
MAPBOX_PUBLIC_KEY

#Inserts optional prometheus monitoring middleware
# Express-prom-bundle exposes a '/metrics' endpoint which can be queried by prometheus
# This endpoint requires basic auth defined by:
PROMETHEUS_USERNAME
PROMETHEUS_PASSWORD

# Application defaults configuration
NEAREST_RADIUS_DEFAULT
NEAREST_RADIUS_MAX
NEAREST_LIMIT_DEFAULT
NEAREST_LIMIT_MAX
SEARCH_LIMIT_DEFAULT
SEARCH_LIMIT_MAX
BULKGEOCODE_GEOLOCATIONS_MAX
BULKGEOCODE_GEOLOCATIONS_ASYNC_LIMIT
BULKGEOCODE_GEOLOCATIONS_TIMEOUT
BULKLOOKUPS_POSTCODES_MAX
BULKLOOKUPS_POSTCODES_ASYNC_LIMIT
BULKLOOKUPS_POSTCODES_TIMEOUT
NEARESTOUTCODES_RADIUS_DEFAULT
NEARESTOUTCODES_RADIUS_MAX
NEARESTOUTCODES_LIMIT_DEFAULT
NEARESTOUTCODES_LIMIT_MAX
PLACESSEARCH_LIMIT_DEFAULT
PLACESSEARCH_LIMIT_MAX
PLACESCONTAINED_LIMIT_DEFAULT
PLACESCONTAINED_LIMIT_MAX
PLACESNEAREST_LIMIT_DEFAULT
PLACESNEAREST_LIMIT_MAX
PLACESNEAREST_RADIUS_DEFAULT
PLACESNEAREST_RADIUS_MAX
```
