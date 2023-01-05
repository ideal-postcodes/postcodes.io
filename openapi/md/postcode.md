Postcodes.io is a free postcode lookup API and geocoder for the UK

## Endpoint
All services can be accessed from the following HTTP[S] endpoint

https://api.postcodes.io
The API accepts GET and POST requests. POST methods use content type application/json

## Data Extraction
The Postcodes.io application and database are packaged as Docker images for rapid local deployment and data extraction.

To perform one-time data extraction tasks using SQL, see our local data extraction guide.

## Responses
JSON(P) only. CORS is enabled.

Each response comes with an appropriate HTTP Status code (except for JSONP requests). These include 200 for success, 400 for a bad request, 404 for not found and 500 for server error. The HTTP Status code is also included in the response body.

## Authentication
Postcodes.io does not require any authentication.

## Error Handling
To check for errors, examine the HTTP response code. 200 response indicates success while any other code will provide important information about why an error occured.

Alternatively, you can examine status code in the 'status' property in the result body.

All JSONP requests return 200 responses because of silent errors. When using JSONP, be sure to use the latter method to check for errors.

## Versioning
The API currently does not use any form of versioning. Any changes to the API will be backwards-compatible, this includes: adding new properties to responses, adding new endpoints, adding new optional request parameters and changing the order of properties.

If we make backwards-incompatible changes in the future, this will be released under a versioned endpoint.