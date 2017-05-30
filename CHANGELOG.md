# Changelog

Any changes, including backwards incompatible changes will be listed here

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
