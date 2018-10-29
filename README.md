[![CircleCI](https://circleci.com/gh/ideal-postcodes/postcodes.io/tree/master.svg?style=svg)](https://circleci.com/gh/ideal-postcodes/postcodes.io/tree/master) [![Coverage Status](https://coveralls.io/repos/github/ideal-postcodes/postcodes.io/badge.svg?branch=master)](https://coveralls.io/github/ideal-postcodes/postcodes.io?branch=master) [![Greenkeeper badge](https://badges.greenkeeper.io/ideal-postcodes/postcodes.io.svg)](https://greenkeeper.io/)

# Postcodes.io

Query for UK postcodes and geolocations over HTTP. Postcodes.io uses the Office for National Statistics Postcode Directory.

Documentation can be found at [postcodes.io](http://postcodes.io)

## Requirements

Please make sure you have the following available:

- Node.js v6.x [(Instructions)](http://nodejs.org/)
- Postgres (9.5 or greater)
- PostGIS extension [(Instructions)](http://postgis.net/install)

We also have an end-to-end guide to install Postcodes.io on a fresh virtual machine [in the wiki](https://github.com/ideal-postcodes/postcodes.io/wiki/Installing-Postcodes.io).

## Install & Download Data & Run

**Download and install**

```bash
$ git clone https://github.com/ideal-postcodes/postcodes.io.git

$ cd postcodes.io/ && npm install
```

**Configure Postgres and Seed Database**

Postcodes.io is packaged with a script to setup and download the ONS Postcode Directory. To run this, navigate into the repository directory and run,

```
$ npm run setup
```

This script will prompt you for Postgres superuser credentials. This privilege is required to create a new user, database, extensions and then to load the data. For the security conscious, you can find out how this works by [reading our installation notes](http://postcodes.io/docs#Install-notes) and [the script itself](/bin/setup.sh). Other install methods are available but require a bit of extra work.

You can change the Postgres username/password yourself but you will need to update 'config/config.js' with the relevant credentials.

The import process takes around 10 minutes to complete.

**Run it**

```
node server.js // Default environment is development
```

## Docker

This repository builds 2 both application and database services as docker containers

### Application

The Postcodes.io application is packaged as a Docker container identified on the Docker Hub as `idealpostcodes/postcodes.io`.

Example usage:

```
docker run -d -p 8000 idealpostcodes/postcodes.io
```

Configuration available via Environment Variables:

- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`
- `POSTGRES_HOST`
- `POSTGRES_PORT`
- `PORT` (HTTP Port to run on)
- `MAPBOX_PUBLIC_KEY`

### Database

`idealpostcodes/postcodes.io.db` points to a [PostgreSQL & PostGIS](https://hub.docker.com/r/mdillon/postgis/) base image and preloads the latest `pg_dump` in the build process. Upon starting a container for the first time, PostGIS will be enabled and the `pg_dump` will take around a minute to restore.

Example usage:

```
docker run -p 5432 -e POSTGRES_USER=postcodesio -e POSTGRES_DB=postcodesiodb -e POSTGRES_PASSWORD=password idealpostcodes/postcodes.io.db
```

As this contains the official postgres base image, the available configuration environment variables are documented here: [https://hub.docker.com/_/postgres/](https://hub.docker.com/_/postgres/)

## Testing

```
$ npm run setup_test_db # create test database

$ npm test
```

## External Libraries

1. [Java Library](https://github.com/spdeepak/postcodes-io-java) by [Deepak Sunanda Prabhakar](https://github.com/spdeepak) 

2. PHP Libraries
	* [postcodes-io-bundle](https://github.com/boxuk/postcodes-io-bundle) by the people at [Box UK](https://www.boxuk.com/). Read the [Blog post](https://www.boxuk.com/insight/tech-posts/geocoding-postcodes-symfony2)<br/>
	* [postcodes-io laravel](https://github.com/adityamenon/postcodes-io-laravel) package by [Aditya Menon](http://adityamenon.co)<br/>
	* [Postcodes Laravel 5+](https://github.com/codescheme/postcodes) package by [Codescheme](https://github.com/codescheme)<br/>
	* [PHP Class for Postcodes.io](https://github.com/hart1994/Postcodes-IO-PHP) by [Ryan](https://github.com/hart1994/)<br/>

3. [Ruby Library](https://github.com/jamesruston/postcodes_io) by [James Ruston](https://github.com/jamesruston)

4. [Node.JS Library](https://github.com/cuvva/postcodesio-client-node) by [billinghamj](https://github.com/billinghamj) 

5. [Python Library](https://github.com/previousdeveloper/PythonPostcodesWrapper) by [Gokhan Karadas](https://github.com/previousdeveloper)

6. [C# Library](https://github.com/markembling/MarkEmbling.PostcodesIO) by [Mark Embling](https://github.com/markembling)

7. [R Library](https://github.com/erzk/PostcodesioR) by [Eryk Walczak](http://walczak.org). Read the [blog post](http://walczak.org/2016/07/postcode-and-geolocation-api-for-the-uk/).

8. [Hack Library](https://github.com/Matt-Barber/HackPostcodes) HackPostcodes by [Matt Barber](https://recursiveiterator.wordpress.com/) 

9. [Wolfram Language Library](https://github.com/arnoudbuzing/postcode) Postcode by [Arnoud Buzing](https://github.com/arnoudbuzing) 

10. [Google Sheets Addon](https://chrome.google.com/webstore/detail/uk-postcode-geocoder/bjkecdilmiedfkihpgfhfikchkghliia?utm_source=permalink) by [Ed Patrick](http://edwebdeveloper.com/)

## License 

MIT
