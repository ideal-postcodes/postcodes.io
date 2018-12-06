[![CircleCI](https://circleci.com/gh/ideal-postcodes/postcodes.io/tree/master.svg?style=svg)](https://circleci.com/gh/ideal-postcodes/postcodes.io/tree/master) [![Coverage Status](https://coveralls.io/repos/github/ideal-postcodes/postcodes.io/badge.svg?branch=master)](https://coveralls.io/github/ideal-postcodes/postcodes.io?branch=master) [![Greenkeeper badge](https://badges.greenkeeper.io/ideal-postcodes/postcodes.io.svg)](https://greenkeeper.io/)

# Postcodes.io

Query for UK postcodes and geolocations over HTTP. Postcodes.io uses the Office for National Statistics Postcode Directory.

Documentation can be found at [postcodes.io](http://postcodes.io)

## Requirements

Please make sure you have the following available:

- Node.js v8.9 [(Instructions)](http://nodejs.org/)
- PostgreSQL (10 or greater)
- PostGIS extension [(Instructions)](http://postgis.net/install)

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
