Accepts a JSON object containing an array of postcodes. Returns a list of matching postcodes and respective available data.

Be sure to submit JSON requests setting `Content-Type` to `application/json`

Accepts up to 100 postcodes.

### Post Data

This method requires a JSON object containing an array of postcodes to be posted, e.g.

```json
{
  "postcodes": ["PR3 0SG", "M45 6GN", "EX165BL"]
}
```

## Bulk Reverse Geocoding

Bulk translates geolocations into Postcodes. Accepts up to 100 geolocations.
