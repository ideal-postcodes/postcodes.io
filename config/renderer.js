"use strict";

const { logger } = require("commonlog-bunyan");
const filter = require("./filter");
const {
  PostcodesioHttpError,
} = require("../app/lib/errors.js");

const genericError = new PostcodesioHttpError();

/**
 * Returns JSON response on behalf of routes that return `response.jsonApiResponse`
 *
 * CORS is enabled at this layer.
 * If JSONP is detected, a 200 response is returned regardless of success.
 */
const renderer = (request, response, next) => {
	const jsonResponse = response.jsonApiResponse;
	if (!jsonResponse) return next();
	if (request.query.callback) return response.status(200).jsonp(jsonResponse);
  return response.status(jsonResponse.status).json(jsonResponse);
};

const invalidJsonErrorMessage = [
	"Invalid JSON submitted.",
	"You need to submit a JSON object with an array of postcodes or geolocation objects.",
	"Also ensure that Content-Type is set to application/json"
].join(" ");

/**
 * Applies an instance of PostcodesioHttpError to a response
 * @param {Express.Response} res - Express response object
 * @param {PostcodesioHttpError} err - PostcodesioHttpError instance
 * @returns {undefined}
 */
const applyError = (res, err) => res.status(err.status).json(err.toJSON());

/**
 * Handles Requests that have resulted in an error. Invoked by next(someError)
 */
const errorRenderer = (error, request, response, next) => {/*jshint unused: false */
	logger.error({error: error.message});
	if (process.env.NODE_ENV !== "test") console.log(error.stack);
	
	//check if bodyParser.json() fails to parse JSON request
	if (error instanceof SyntaxError &&
			error.status === 400 &&
			request.method === "POST") {
		return response.status(400).json({
			status: 400,
			error: invalidJsonErrorMessage
		});
	} 

	// Return 500 for all other errors
  return applyError(response, genericError);
};

/**
*	Handles requests that have fallen through middleware stack by returning a 404
*/
const notFoundRenderer = (request, response) => {
	response.status(404).json({
		status: 404, 
		error: "Resource not found"
	});
};

module.exports = app => {
	app.use(filter);
	app.use(renderer);
	app.use(errorRenderer);
	app.use(notFoundRenderer);
};
