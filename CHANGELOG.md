# Changelog

Any changes, including backwards incompatible changes will be listed here

## 7.0.0 (8/12/2017)

- *Breaking Change* Place schema has been amended with additional columns to support better text search for place names. When upgrading, `places` will need to be rebuilt
- Added Dockerfile & Dockerhub Repository (thanks to @jamescun and @billinghamj)
- Fix: Added missing filterable attributes for `?filter=`
- Updated dependencies
- Updated NUTS, Wards, Parishses GSS codes
- Added optional rate limiting on bulk lookup endpoints

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
- npm package now points to `app.js` which exports instance postcodes.io express app
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
