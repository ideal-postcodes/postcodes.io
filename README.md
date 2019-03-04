![Open Source Logo](https://img.ideal-postcodes.co.uk/postcodes-open-source.svg)

[![CircleCI](https://circleci.com/gh/ideal-postcodes/postcodes.io/tree/master.svg?style=svg)](https://circleci.com/gh/ideal-postcodes/postcodes.io/tree/master) [![Coverage Status](https://coveralls.io/repos/github/ideal-postcodes/postcodes.io/badge.svg?branch=master)](https://coveralls.io/github/ideal-postcodes/postcodes.io?branch=master) ![Dependency Status](https://david-dm.org/ideal-postcodes/postcodes.io.svg) 

# Postcodes.io

Query for UK postcodes and geolocations over HTTP. Postcodes.io uses the Office for National Statistics Postcode Directory.

Documentation can be found at [postcodes.io](http://postcodes.io)

## Requirements

Please make sure you have the following available:

- Node.js v8.9 [(Instructions)](http://nodejs.org/)
- PostgreSQL (10 or greater)
- PostGIS extension [(Instructions)](http://postgis.net/install)

## Run with Docker

```bash
docker-compose up
```

<p align="center">
  <img src="https://img.ideal-postcodes.co.uk/postcodesio-docker-compose-demo.gif" alt="Docker Compose Demo">
</p>

## Self Hosting

Instructions for installing and hosting postcodes.io yourself can be found at [postcodes.io/docs](https://postcodes.io/docs#Install-notes). Methods include:

- [Install as Docker containers](https://postcodes.io/docs#docker-install)
- [Install on host with Node.js and Postgresql](https://postcodes.io/docs#install-requirements)
- [Download and import the raw dataset to Postgresql](https://postcodes.io/docs#import-from-pgdump)

Application configuration options are outlined in [`config/README.md`](/config/README.md).

## Testing

```bash
# Run a postgres container listening on port 5432
docker-compose -f docker-compose-test.yml up 

npm test
```

## External Libraries

A list of external libraries can be found on the [about page](https://postcodes.io/about)

## License

MIT

