<h1 align="center">
  <img src="https://img.ideal-postcodes.co.uk/Postcodes.io%20Logo@3x.png" alt="Postcodes.io">
</h1>

> UK postcode & geolocation API, serving up open data

![CI](https://github.com/ideal-postcodes/postcodes.io/workflows/CI/badge.svg)
[![DOI](https://zenodo.org/badge/15987081.svg)](https://zenodo.org/badge/latestdoi/15987081)

Query for UK postcodes and geolocations over HTTP.

Postcodes.io regularly ingests and serves the [ONS Postcode Directory](https://geoportal.statistics.gov.uk/search?collection=Dataset&sort=-created&tags=onspd) and [Ordnance Survey Open Names](https://www.ordnancesurvey.co.uk/products/os-open-names) datasets.

## Features

- Postcode lookup, resolve administrative and location data for postcodes and outward codes
- Postcode search & autocomplete
- Reverse geocode postcodes
- Nearest postcode search
- Terminated postcode search
- Outward code lookup
- Bulk postcode lookup and reverse geocoding

## Usage

- [Public API](https://postcodes.io)
- [API Documentation](https://postcodes.io/docs)
- [3rd Party API Clients](https://postcodes.io/about)
- [Public API Service Status](https://status.ideal-postcodes.co.uk)
- [Self Hosting: Docker containers](https://postcodes.io/docs#docker-install)
  - [Docker Hub Container Image: Postcodes.io Application](https://hub.docker.com/r/idealpostcodes/postcodes.io)
  - [Docker Hub Container Image: Postcodes.io Database](https://hub.docker.com/r/idealpostcodes/postcodes.io.db)

## Quick Start

Start querying UK postcode data immediately on your local machine with Docker

```bash
docker-compose up
```

<p align="center">
  <img src="https://img.ideal-postcodes.co.uk/postcodesio-docker-compose-demo.gif" alt="Docker Compose Demo">
</p>

## Testing

```bash
# Run entire test suite
make test

# Launch test application container and services, and run tests from container
make test-up
make test-shell
$api-container> npm test
```

## License

MIT
