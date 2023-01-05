# Overview

Postcodes.io is a free postcode lookup API and geocoder for the UK

## Endpoint
All services can be accessed from the following HTTP[S] endpoint

`https://api.postcodes.io`
The API accepts GET and POST requests. POST methods use content type application/json

## Responses
JSON(P) only. CORS is enabled.

Each response comes with an appropriate HTTP Status code (except for JSONP requests). These include 200 for success, 400 for a bad request, 404 for not found and 500 for server error. The HTTP Status code is also included in the response body.

## Authentication
Postcodes.io does not require any authentication.

## Versioning
The API currently does not use any form of versioning. Any changes to the API will be backwards-compatible, this includes: adding new properties to responses, adding new endpoints, adding new optional request parameters and changing the order of properties.

If we make backwards-incompatible changes in the future, this will be released under a versioned endpoint.