Query for a postcode either by:

- The postcode itself (with `postcode=`) or by,
- A geolocation (`lat=` and `lon=`).

## Query with Postcode

Submit a postcode query and receive a complete list of postcode matches and all associated postcode data. This is triggered when `query=` is supplied.

This is essentially a postcode search which prefix matches and returns postcodes in sorted order (case insensitive)

This method is space sensitive, i.e. it detects for spaces between outward and inward parts of the postcode (some examples detailed in this [issue](https://github.com/ideal-postcodes/postcodes.io/issues/44))

The result set can either be empty or populated with up to 100 postcode entities. Either way it will always return a 200 response code

## Query with Geolocation

Returns nearest postcodes for a given longitude and latitude. This is triggered when `lat=` and `lon=` is supplied.
