[![CircleCI](https://circleci.com/gh/ideal-postcodes/postcodes.io/tree/master.svg?style=svg)](https://circleci.com/gh/ideal-postcodes/postcodes.io/tree/master) [![Coverage Status](https://coveralls.io/repos/github/ideal-postcodes/postcodes.io/badge.svg?branch=master)](https://coveralls.io/github/ideal-postcodes/postcodes.io?branch=master) [![Greenkeeper badge](https://badges.greenkeeper.io/ideal-postcodes/postcodes.io.svg)](https://greenkeeper.io/)

# Postcodes.io

Query for UK postcodes and geolocations over HTTP. Postcodes.io uses the Office for National Statistics Postcode Directory.

Documentation can be found at [postcodes.io](http://postcodes.io)

## Requirements

Please make sure you have the following available:

- Node.js v8.9 [(Instructions)](http://nodejs.org/)
- PostgreSQL (10 or greater)
- PostGIS extension [(Instructions)](http://postgis.net/install)

## Run with Docker

```
docker-compose up
```

## Self Hosting

Instructions for installing and hosting postcodes.io yourself can be found at [postcodes.io/about](https://postcodes.io/about#Install-notes). Methods include:

- [Install as Docker containers](https://postcodes.io/about#docker-install)
- [Install on host with Node.js and Postgresql](https://postcodes.io/about#install-requirements)
- [Download and import the raw dataset to Postgresql](https://postcodes.io/about#import-from-pgdump)

## Testing

```
$ npm run setup_test_db # create test database

$ npm test
```

## External Libraries

A list of external libraries can be found on the [about page](https://postcodes.io/about)

## License 

MIT
