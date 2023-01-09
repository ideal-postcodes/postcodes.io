Returns the complete list of addresses for a postcode. Postcode searches are space and case insensitive.

The Postcode Lookup API provides a JSON interface to search UK addresses from a postcode. It can be used to power Postcode Lookup driven address searches, like [Postcode Lookup](/postcode-lookup).

## Postcode Not Found

Lookup balance is unaffected by invalid postcodes. The API returns a `404` response with response body:

```json
{
  "code": 4040,
  "message": "Postcode not found",
  "suggestions": ["SW1A 0AA"]
}
```

### Suggestions

If a postcode cannot be found, the API will provide up to 5 closest matching postcodes. Common errors will be corrected first (e.g. mixing up `O` and `0` or `I` and `1`).

If the suggestion list is small (fewer than 3), there is a high probability the correct postcode is there. You may notify the user or immediately trigger new searches.

The suggestion list will be empty if the postcode has deviated too far from a valid postcode format.
