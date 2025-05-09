Postcodes.io is a free postcode lookup API and geocoder for the UK.

## Endpoint

All services can be accessed from the following endpoint.

```
https://api.postcodes.io
```

The API accepts GET and POST requests. POST methods use content type `application/json`.

## Responses

Each response comes with an appropriate HTTP Status code (except for JSONP requests). These include 200 for success, 400 for a bad request, 404 for not found and 500 for server error. The HTTP Status code is also included in the response body.

## Authentication

Postcodes.io does not require authentication.
