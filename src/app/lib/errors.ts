import config from "../../config/config";
const { defaults } = config();

const DEFAULT_STATUS_CODE = 500;
const DEFAULT_MESSAGE = `500 Server Error.
For an urgent fix email support@ideal-postcodes.co.uk. 
Alternatively submit an issue at https://github.com/ideal-postcodes/postcodes.io/issues
`;

/**
 * Returns an API error which can be parsed by renderer
 */
export class PostcodesioHttpError extends Error {
  //  HTTP status code
  public status: number;
  //  Error message to be returned to client
  public humanMessage: string;

  constructor(status?: number, humanMessage?: string) {
    status = status || DEFAULT_STATUS_CODE;
    humanMessage = humanMessage || DEFAULT_MESSAGE;
    const message = `PostcodesIO HTTP Error: ${status} ${humanMessage}`;
    super(message);
    // Set the prototype explicitly
    // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, PostcodesioHttpError.prototype);
    this.name = this.constructor.name;
    this.status = status;
    this.humanMessage = humanMessage;
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Returns JSON response which can be parsed by interpreter
   */
  toJSON() {
    return {
      status: this.status,
      error: this.humanMessage,
    };
  }
}

const INVALID_JSON_MESSAGE = `Invalid JSON submitted.
You need to submit a JSON object with an array of postcodes or geolocation objects.
Also ensure that Content-Type is set to application/json
`;

export class InvalidJsonError extends PostcodesioHttpError {
  constructor() {
    super(400, INVALID_JSON_MESSAGE);
  }
}

export class NotFoundError extends PostcodesioHttpError {
  constructor() {
    super(404, "Resource not found");
  }
}

export class InvalidPostcodeError extends PostcodesioHttpError {
  constructor() {
    super(404, "Invalid postcode");
  }
}

export class PostcodeNotFoundError extends PostcodesioHttpError {
  constructor() {
    super(404, "Postcode not found");
  }
}

export class PostcodeNotInSpdError extends PostcodesioHttpError {
  constructor() {
    super(404, "Postcode exists in ONSPD but not in SPD");
  }
}
const INVALID_JSON_QUERY_MESSAGE = `Invalid JSON query submitted. 
You need to submit a JSON object with an array of postcodes or geolocation objects.
Also ensure that Content-Type is set to application/json
`;

export class InvalidJsonQueryError extends PostcodesioHttpError {
  constructor() {
    super(400, INVALID_JSON_QUERY_MESSAGE);
  }
}

export class JsonArrayRequiredError extends PostcodesioHttpError {
  constructor() {
    super(400, "Invalid data submitted. You need to provide a JSON array");
  }
}

const MAX_GEOLOCATIONS = defaults.bulkGeocode.geolocations.MAX;
const MAX_GEOLOCATIONS_MESSAGE = `Too many locations submitted. Up to ${MAX_GEOLOCATIONS} locations can be bulk requested at a time`;

export class ExceedMaxGeolocationsError extends PostcodesioHttpError {
  constructor() {
    super(400, MAX_GEOLOCATIONS_MESSAGE);
  }
}

const MAX_POSTCODES = defaults.bulkLookups.postcodes.MAX;
const MAX_POSTCODES_MESSAGE = `Too many postcodes submitted. Up to ${MAX_POSTCODES} postcodes can be bulk requested at a time`;

export class ExceedMaxPostcodesError extends PostcodesioHttpError {
  constructor() {
    super(400, MAX_POSTCODES_MESSAGE);
  }
}

export class PostcodeQueryRequiredError extends PostcodesioHttpError {
  constructor() {
    super(
      400,
      "No postcode query submitted. Remember to include query parameter"
    );
  }
}

export class InvalidGeolocationError extends PostcodesioHttpError {
  constructor() {
    super(400, "Invalid longitude/latitude submitted");
  }
}

export class InvalidLimitError extends PostcodesioHttpError {
  constructor() {
    super(400, "Invalid result limit submitted");
  }
}

export class InvalidRadiusError extends PostcodesioHttpError {
  constructor() {
    super(400, "Invalid lookup radius submitted");
  }
}

export class TPostcodeNotFoundError extends PostcodesioHttpError {
  constructor() {
    super(404, "Terminated postcode not found");
  }
}

export class PlaceNotFoundError extends PostcodesioHttpError {
  constructor() {
    super(404, "Place not found");
  }
}

export class InvalidQueryError extends PostcodesioHttpError {
  constructor() {
    super(400, "No valid query submitted. Remember to include every parameter");
  }
}

export class OutcodeNotFoundError extends PostcodesioHttpError {
  constructor() {
    super(404, "Outcode not found");
  }
}
