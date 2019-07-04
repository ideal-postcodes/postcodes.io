<h1 align="center">
  <img src="https://img.ideal-postcodes.co.uk/Postcodes.io%20Logo@3x.png" alt="Postcodes.io">
</h1>

> UK postcode & geolocation API, serving up open data

[![CircleCI](https://circleci.com/gh/ideal-postcodes/postcodes.io/tree/master.svg?style=svg)](https://circleci.com/gh/ideal-postcodes/postcodes.io/tree/master)
[![Coverage Status](https://coveralls.io/repos/github/ideal-postcodes/postcodes.io/badge.svg?branch=master)](https://coveralls.io/github/ideal-postcodes/postcodes.io?branch=master)
![Dependency Status](https://david-dm.org/ideal-postcodes/postcodes.io.svg) 

Query for UK postcodes and geolocations over HTTP.

Postcodes.io regularly ingests and serves the [ONS Postcode Directory](https://geoportal.statistics.gov.uk/datasets?q=ONSPD&sort=name&t=ons%20postcode%20directory) and [Ordnance Survey Open Names](https://www.ordnancesurvey.co.uk/business-and-government/products/os-open-names.html) datasets.

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
- [Self Hosting](https://postcodes.io/docs#Install-notes)
- [Self Hosting: Docker containers](https://postcodes.io/docs#docker-install)
  - [Docker Hub Container Image: Postcodes.io Application](https://hub.docker.com/r/idealpostcodes/postcodes.io)
  - [Docker Hub Container Image: Postcodes.io Database](https://hub.docker.com/r/idealpostcodes/postcodes.io.db)
- [Self Hosting: Node.js and Postgresql](https://postcodes.io/docs#install-requirements)
- [Self Hosting: Database only - Download and import the raw dataset to Postgresql](https://postcodes.io/docs#import-from-pgdump)
- [Explore](https://postcodes.io/explore)
- [Chat](https://chat.ideal-postcodes.co.uk)

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
# Run a postgres container listening on port 5432
docker-compose -f .docker/docker-compose.testenv.yml up 

npm test
```

## License

MIT

