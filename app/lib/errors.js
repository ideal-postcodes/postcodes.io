"use strict";

const { defaults } = require("../../config/config")();

const DEFAULT_STATUS_CODE = 500;
const DEFAULT_MESSAGE = `500 Server Error.
For an urgent fix email support@ideal-postcodes.co.uk. 
Alternatively submit an issue at https://github.com/ideal-postcodes/postcodes.io/issues
`;

/**
 * Returns an API error which can be parsed by renderer
 * @extends Error
 */
class PostcodesioHttpError extends Error {
  /**
   * @param {number} status - HTTP status code
   * @param {string} humanMessage - Error message to be returned to client
   */
  constructor(status, humanMessage) {
    status = status || DEFAULT_STATUS_CODE;
    humanMessage = humanMessage || DEFAULT_MESSAGE;
    const message = `PostcodesIO HTTP Error: ${status} ${humanMessage}`;
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.humanMessage = humanMessage;
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Returns JSON response which can be parsed by interpreter
   * @returns {Object}
   */
  toJSON() {
    return {
      status: this.status,
      error: this.humanMessage
    };
  }
}

const INVALID_JSON_MESSAGE = `Invalid JSON submitted.
You need to submit a JSON object with an array of postcodes or geolocation objects.
Also ensure that Content-Type is set to application/json
`;

class InvalidJsonError extends PostcodesioHttpError {
  constructor() {
    super(400, INVALID_JSON_MESSAGE);
  }
}

class NotFoundError extends PostcodesioHttpError {
  constructor() {
    super(404, "Resource not found");
  }
}

class InvalidPostcodeError extends PostcodesioHttpError {
  constructor() {
    super(404, "Invalid postcode");
  }
}

class PostcodeNotFoundError extends PostcodesioHttpError {
  constructor() {
    super(404, "Postcode not found");
  }
}

class PostcodeNotInSpdError extends PostcodesioHttpError {
  constructor() {
    super(404, "Postcode exists in ONSPD but not in SPD");
  }
}
const INVALID_JSON_QUERY_MESSAGE = `Invalid JSON query submitted. 
You need to submit a JSON object with an array of postcodes or geolocation objects.
Also ensure that Content-Type is set to application/json
`;

class InvalidJsonQueryError extends PostcodesioHttpError {
  constructor() {
    super(400, INVALID_JSON_QUERY_MESSAGE);
  }
}

class JsonArrayRequiredError extends PostcodesioHttpError {
  constructor() {
    super(400, "Invalid data submitted. You need to provide a JSON array");
  }
}

const MAX_GEOLOCATIONS = defaults.bulkGeocode.geolocations.MAX;
const MAX_GEOLOCATIONS_MESSAGE = `Too many locations submitted. Up to ${MAX_GEOLOCATIONS} locations can be bulk requested at a time`;

class ExceedMaxGeolocationsError extends PostcodesioHttpError {
  constructor() {
    super(400, MAX_GEOLOCATIONS_MESSAGE);
  }
}

const MAX_POSTCODES = defaults.bulkLookups.postcodes.MAX;
const MAX_POSTCODES_MESSAGE = `Too many postcodes submitted. Up to ${MAX_POSTCODES} postcodes can be bulk requested at a time`;

class ExceedMaxPostcodesError extends PostcodesioHttpError {
  constructor() {
    super(400, MAX_POSTCODES_MESSAGE);
  }
}

class PostcodeQueryRequiredError extends PostcodesioHttpError {
  constructor() {
    super(
      400,
      "No postcode query submitted. Remember to include query parameter"
    );
  }
}

class InvalidGeolocationError extends PostcodesioHttpError {
  constructor() {
    super(400, "Invalid longitude/latitude submitted");
  }
}

class InvalidLimitError extends PostcodesioHttpError {
  constructor() {
    super(400, "Invalid result limit submitted");
  }
}

class InvalidRadiusError extends PostcodesioHttpError {
  constructor() {
    super(400, "Invalid lookup radius submitted");
  }
}

class TPostcodeNotFoundError extends PostcodesioHttpError {
  constructor() {
    super(404, "Terminated postcode not found");
  }
}

class PlaceNotFoundError extends PostcodesioHttpError {
  constructor() {
    super(404, "Place not found");
  }
}

class InvalidQueryError extends PostcodesioHttpError {
  constructor() {
    super(400, "No valid query submitted. Remember to include every parameter");
  }
}

class OutcodeNotFoundError extends PostcodesioHttpError {
  constructor() {
    super(404, "Outcode not found");
  }
}

module.exports = {
  PostcodesioHttpError,
  InvalidJsonError,
  NotFoundError,
  InvalidPostcodeError,
  PostcodeNotFoundError,
  PostcodeNotInSpdError,
  InvalidJsonQueryError,
  JsonArrayRequiredError,
  ExceedMaxGeolocationsError,
  ExceedMaxPostcodesError,
  PostcodeQueryRequiredError,
  InvalidGeolocationError,
  InvalidLimitError,
  InvalidRadiusError,
  TPostcodeNotFoundError,
  PlaceNotFoundError,
  InvalidQueryError,
  OutcodeNotFoundError
};
