"use strict";

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
      error: this.humanMessage,
    };
  }
}

module.exports = {
  PostcodesioHttpError,
};

