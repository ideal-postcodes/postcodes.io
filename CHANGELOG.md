# [12.1.0](https://github.com/ideal-postcodes/postcodes.io/compare/12.0.4...12.1.0) (2020-08-24)


### Features

* **ONSPD:** Bump to ONSP Aug 2020 ([64f9831](https://github.com/ideal-postcodes/postcodes.io/commit/64f9831a023b123ca9b98d407da0093a40e33ed8))

## [12.0.4](https://github.com/ideal-postcodes/postcodes.io/compare/12.0.3...12.0.4) (2020-08-23)


### Bug Fixes

* **SPD:** Correct and ingest invalid SPD postcodes ([954469c](https://github.com/ideal-postcodes/postcodes.io/commit/954469cd2c7f461182e931ba3c2550edbaedadf4))

## [12.0.3](https://github.com/ideal-postcodes/postcodes.io/compare/12.0.2...12.0.3) (2020-07-09)


### Bug Fixes

* **NUTS:** Incorporate NUTS updates into latest dataset ([2fb71ae](https://github.com/ideal-postcodes/postcodes.io/commit/2fb71ae9e877f05b5399ac2e81d0f5410f8c5eb7))

## [12.0.2](https://github.com/ideal-postcodes/postcodes.io/compare/12.0.1...12.0.2) (2020-07-09)


### Bug Fixes

* **NUTS:** Add missing NUTS from ONSPD May 2020 ([869e264](https://github.com/ideal-postcodes/postcodes.io/commit/869e2648447efc5803fdfa781bca868311b2377f))

## [12.0.1](https://github.com/ideal-postcodes/postcodes.io/compare/12.0.0...12.0.1) (2020-07-02)


### Bug Fixes

* **Demo:** Don't clear input on click ([8f70d0e](https://github.com/ideal-postcodes/postcodes.io/commit/8f70d0e9b8a844364047ce1baca47a8c332fef32)), closes [#541](https://github.com/ideal-postcodes/postcodes.io/issues/541)

# [12.0.0](https://github.com/ideal-postcodes/postcodes.io/compare/11.1.0...12.0.0) (2020-06-22)


### Bug Fixes

* **a11y:** add title attributes to iframe elements and structure headings on page ([65ca5a3](https://github.com/ideal-postcodes/postcodes.io/commit/65ca5a3efaa53db39bb8263ed5cb5f45685a88ee))


### chore

* **Node:** Deprecate node 8, switch to node 12 LTS ([e8d211c](https://github.com/ideal-postcodes/postcodes.io/commit/e8d211c98bbc583061cfb8200a5d75c460cca7a7))


### Features

* **Data:** Update ONSPD, Open Names, SPD ([a92a91a](https://github.com/ideal-postcodes/postcodes.io/commit/a92a91a5a0ba76886c10fbc7016c3044ca073b87))


### BREAKING CHANGES

* **Node:** Node 8 no longer supported

# Changelog

Any changes, including backwards incompatible changes will be listed here

## 11.1.0 (6/3/2020)

- Updated ONSPD to Feb 2020
- Updated Open Names to Jan 2020
- Updated GSS codes for missing parishes
- Chore: Refactored static ejs templates

## 11.0.1 (6/1/2020)

- Fix: codes.cgg incorrectly returning short code rather than GSS code

## 11.0.0 (3/1/2020)

- *Breaking Change* CCG Short Code column added to ccgs table
- CCG Short Code returned in `codes` object
- Update ONSPD to November 2019
- Update OS Open Names to October 2019
- Updated GSS codes for midding NUTS
- Updated GSS codes for midding wards
- New docker-compose setup for test, dev and s3 pg_dump testing

## 10.2.1 (2/9/2019)

- Return specific error message if postcode not in SPD but in ONSPD. Thanks to [@mashedkeyboard](https://github.com/mashedkeyboard)

## 10.2.0 (27/8/2019)

- Update ONSPD to August 2019
- Update OS Open Names to July 2019
- Updated GSS codes for missing wards
- Integrated Scotland Postcode Directory (SPD) dataset
- Added Scotland postcode lookup (for Scottish Constituencies) `/scotland/postcodes/:postcode`

## 10.1.4 (5/7/2019)

- CI testing on node 12 (instead of 11)
- Deprecated PMX configuration option. Use prom-client for monitoring
- Fix: Prom client uses stricter path matching to reduce cardinaility in `path=` label
- Update ONSPD to May 2019
- Update OS Names dataset to April 2019
- Rebuild GSS codes

## 10.1.3 (23/3/2019)

- Enable prometheus endpoint
- .env files loaded upon application start. These are overwritten with explicit ENV variables

## 10.1.2 (7/3/2019)

- Fix: `npm run setup` on ubuntu
- Dependency Update: switch from `pmx` to `@pm2/io`
- Add abiltiy to define google analytics key with environment variable

## 10.1.1 (6/3/2019)

- Fix: renamed and moved docker-compose-test.yml as it [breaks Docker Hub build](https://docs.docker.com/docker-hub/builds/automated-testing/)

## 10.1.0 (3/3/2019)

- Updated ONSPD dataset to February 2019
- Updated OS Names dataset to January 2019
- Rebuild GSS codes for NHSHA and NUTS datasets
- Dropped bunyan as dependency. Replaced with pino, a faster and actively maintained logging library
- Log destination can now be assigned via env variable `LOG_DESTINATION`
  - `"/absolute/path/to/file"` logs to file
  - `"stdout"` logs to stdout
  - `"perf"` logs to stdout in [extreme mode](https://github.com/pinojs/pino/blob/master/docs/extreme.md)
- Added ability to export prometheus metrics by basic auth protected `/metrics` endpoint. To enable include `PROMETHEUS_USERNAME` and `PROMETHEUS_PASSWORD` as environment variables. Those environment variables are required to authenticate using [HTTP basic authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)
- Updated dependencies
- Added ability to configure application limits using environment variables. [See readme](/src/config/README.md)
- Amended `npm run setup` bash script to accept more configuration arguments

## 10.0.1 (16/01/2019)

- Fix: default `config.js` file would fail to load under `NODE_ENV=production` (thanks to @g-wilson)
- Update dependencies
- Added link to new Python lib (thanks to @raigad)
- Clean up documentation

## 10.0.0 (29/11/2018)

- *Breaking Change* Install dependencies upgraded. Going forward, only the following minimum versions will be tested:
  - Node.js 8
  - PostgreSQL 10
- Postcode responses now include County Electoral Districts (ceds)
- Updated documentation (outcodes, installation)
- Updated dependencies
- Updated GSS codes for missing wards
- Updated ONSPD dataset to November 2018
- Updated OS Names dataset to October 2018

## 9.0.3 (26/10/2018)

Minor updates and fixes. Many related to docker improvements

- Fix: /outcodes endpoint returned a `result` attribute rather than an `error` attribute for a not found response
- Docker Related: Application gracefully exits from SIGTERM
- Docker Related: Application writes logs to stdout when `NODE_ENV=production`
- DockerFile:
  - Added healthcheck
  - Run application as non-root user (`node`)
  - Reduced image size: delete npm cache, added .dockerignore
- DockerFile.pg:
  - New docker file that builds a postgresql container that preloads postcodesio.io dataset

## 9.0.2 (23/8/2018)

- Updated ONSPD dataset to August 2018
- Updated OS Names dataset to July 2018

## 9.0.1 (18/6/2018)

- Fixed regression. WGS84 geolocations for points with no assigned geolocation (in `postcodes` and `terminated_postcodes` relations) returned `0` and `99.9999` (ONSPD default identifiers for no geolocation) instead of `null` and `null`.
- Updated `pg_dump` released in 9.0.0 to incorporate above fix
- Updated noticeboard

## 9.0.0 (8/6/2018)

- *Breaking Change* Updated `postcode` and `terminated_postcode` models for the new schema in ONSPD CSV file. This means `>9.0.0` will not be able to import ONSPD CSV files produced before May 2018. `pg_dump` imports will not be affected
- Added package.lock file
- Updated wards, districts, nuts, ccgs GSS Codes
- Updated ONSPD dataset to May 2018
- Updated OS Names dataset to April 2018

## 8.0.0 (6/3/2018)

- *Breaking Change* Terminated Postcode schema has been updated to include geolocation attributes: `longitude`, `latitude`, `northings`, `eastings` and `location`
- Extended `/terminated_postcodes` endpoint to include `longitude` and `latitude`
- Updated parishes GSS Codes
- Tidy up of ONSPD and Open Names import scripts. Now named `postcodesio-onspd` and `postcodesio-oson` respectively. Dropped unmaintained update script
- Updated ONSPD dataset to Feb 2018
- Updated OS Names dataset to Jan 2018

## 7.0.1 (26/1/2018)

- Fixed performance regression on `/places` endpoint where postgresql's unaccent() causing index miss

## 7.0.0 (8/12/2017)

- *Breaking Change* Place schema has been amended with additional columns to support better text search for place names. When upgrading, `places` will need to be rebuilt
- Added Dockerfile & Dockerhub Repository (thanks to @jamescun and @billinghamj)
- Fix: Added missing filterable attributes for `?filter=`
- Updated dependencies
- Updated NUTS, wards, parishes GSS codes
- Added optional rate limiting on bulk lookup endpoints
- Updated ONSPD dataset to Nov 2017
- Updated OS Names dataset to Oct 2017

## 6.1.1 (28/9/2017)

- Updated dependencies
- [Dev] Run code coverage and linter by default

## 6.1.0 (4/9/2017)

- Minimum required version of node.js bumped to 6.x
- Added terminated postcodes relation and /terminated_postcodes API
- Postcode responses now include a GSS code for parliamentary constituencies
- Extraction scripts data files (`data/*.json`) now stored in `data/scripts/` and will effectively document how the data files are generated
- Mispecified resources (404 errors) now return JSON instead of application/text
- Invalid JSON post requests return 400 errors instead of 500 HTTP response codes
- Updated ONSPD dataset to Aug 2017
- Updated OS Names dataset to July 2017

## 6.0.1 (29/7/2017)

- Bulk postcode lookups now accept a `filter` parameter to restrict the attributes of the returned result set

### Data File Changes

The extraction process for the key/value (JSON) representation of GSS codes stored in the `data/` directory is now formally documented with code in the `data/scripts/` directory. See the README.md for more information

Following the formalisation, some data files were rebuilt and the following datasets have been modified:

- Districts: 4 names have been updated
```
"Eilean Siar" is now "Na h-Eileanan Siar"
"Armagh, Banbridge and Craigavon" is now "Armagh City, Banbridge and Craigavon"
"Derry and Strabane" is now "Derry City and Strabane"
"North Down and Ards" is now "Ards and North Down"
```
- LSOA: A large number of Scottish LSOAs have been expanded to include more information. E.g. For code `S01013429`, "Blackridge" is now "Blackridge, Westfield and Torphichen - 01"
- MSOA: A large number of Scottish LSOAs have been expanded to include more information. E.g. For code `S02001501`, "Altonhill South" is now "Altonhill South, Longpark and Hillhead"
- NHSHA: Dropping codes S08000001 to S08000014 as they appear to no longer feature in ONSPD
- NHSHA: 4 names have been modified
```
"Health & Social Care Board" => "ZB001"
"Jersey" => "Jersey Health Authority"
"Guernsey (including Sark and Herm)" => "Guernsey Health Authority"
"Alderney " => "Sark Health Authority"
```
- Parishes: ~60 names have been updated for various reasons. Some have had a preceeding backslash remove, some have been expanded, some are renamed
- PCTS: 7 names have been expanded
```
"Betsi Cadwaladr University" => "Betsi Cadwaladr University Health Board"
"Powys Teaching" => "Powys Teaching Health Board"
"Hywel Dda" => "Hywel Dda University Health Board"
"Abertawe Bro Morgannwg University" => "Abertawe Bro Morgannwg University Health Board"
"Cwm Taf" => "Cwm Taf University Health Board"
"Aneurin Bevan" => "Aneurin Bevan University Health Board"
"Cardiff and Vale University" => "Cardiff and Vale University Health Board"
```
- CCG: Naming is more consistent. CCG suffix will always be dropped (previously there were 5 exceptions)

For the exact changes, you can may inspect the most recent commit applied to the file

## 6.0.0 (29/6/2017)

- *Breaking Change* Outcode schema has been modified to include country. When upgrading it's sufficient to rebuild support tables with `npm run rebuild_support_tables`
- `/outcodes/:outcode`, `/outcodes/:outcode/nearest` and `/outcodes` now also return a `country` array in the outcode result

## 5.0.0 (24/5/2017)

- *Breaking Change* Postcode schema has been modified to facilitate faster and better quality
- Faster and better quality postcode search and autocomplete
- Add missing wards for ONSPD May 2017

## 4.0.1 (23/2/2017)
- Update express & body-parser

## 4.0.0 (23/2/2017)
- Incorporate OS Places dataset
- npm package now points to `app.ts` which exports instance postcodes.io express app
- Minimum advised required Postgresql version of 9.5 (due to backwards incompatible pg_dump)
- Updated latest pg_dump for Feb 2017 ONSPD, January 2017 OS Places data

## 3.0.3
- Updated latest pg_dump for Nov 2016 ONSPD
- Updated NUTS GSS codes
- Added support for Node.js 6.9

## 3.0.2
- Updated latest pg_dump for Aug 2016 ONSPD

## 3.0.1
- Added some missing GSS codes. Fix import script for Aug 2016 ONSPD

## 3.0.0
- Drop support for node.js 0.10 and 0.12

## 2.0.1
- Expanded accept headers and HTTP methods in CORS preflight requests

## 2.0.0
- Updated dataset to February 2016
