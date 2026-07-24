# Postcodes.io Configuration

## Overview

Postcodes.io accepts configurations from environment variables and the .env file in the root directory.

Environment variable configuration takes precedence.

Default configuration values can be found at `config/config.js` and `config/defaults.js`.

## Configuration Options

```bash
# HTTP
HOST # Host/interface to bind to (defaults to `0.0.0.0`)
PORT # Port to listen on
URL_PREFIX # Prefix to append to all routes in this app

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

#Inserts optional prometheus monitoring middleware
# Express-prom-bundle exposes a '/metrics' endpoint which can be queried by prometheus
# This endpoint requires basic auth defined by:
PROMETHEUS_USERNAME
PROMETHEUS_PASSWORD

# Inserts optional PostHog monitoring middleware
# Captures an `api_request` event per request (normalized path, method, status, duration)
POSTHOG_API_KEY # PostHog project API key. Monitoring is disabled if unset
POSTHOG_HOST # Optional PostHog instance host, e.g. https://eu.i.posthog.com

# Application defaults configuration
NEAREST_RADIUS_DEFAULT       # /postcodes?lon=&lat= radius default (metres, default 100)
NEAREST_RADIUS_MAX           # /postcodes?lon=&lat= radius cap (metres, default 2000)
NEAREST_LIMIT_DEFAULT        # /postcodes?lon=&lat= result count default (default 10)
NEAREST_LIMIT_MAX            # /postcodes?lon=&lat= result count cap (default 100)
SEARCH_LIMIT_DEFAULT         # /postcodes?q= result count default (default 10)
SEARCH_LIMIT_MAX             # /postcodes?q= result count cap (default 100)
BULKGEOCODE_GEOLOCATIONS_MAX # POST /postcodes geolocations[] array cap (default 100)
BULKLOOKUPS_POSTCODES_MAX    # POST /postcodes postcodes[] array cap (default 100)
NEARESTOUTCODES_RADIUS_DEFAULT # /outcodes?lon=&lat= radius default (metres, default 5000)
NEARESTOUTCODES_RADIUS_MAX     # /outcodes?lon=&lat= radius cap (metres, default 25000)
NEARESTOUTCODES_LIMIT_DEFAULT  # /outcodes?lon=&lat= result count default (default 10)
NEARESTOUTCODES_LIMIT_MAX      # /outcodes?lon=&lat= result count cap (default 100)
PLACESSEARCH_LIMIT_DEFAULT     # /places?q= result count default (default 10)
PLACESSEARCH_LIMIT_MAX         # /places?q= result count cap (default 100)
```
