"use strict";

const logger = require("commonlog-bunyan").logger;
const jsonApiResponseFilter = require("./filter");

/**
 * Returns JSON response on behalf of routes that return `response.jsonApiResponse`
 *
 * CORS is enabled at this layer.
 * If JSONP is detected, a 200 response is returned regardless of success.
 */
function jsonApiResponseRenderer (request, response, next) {
	const jsonResponse = response.jsonApiResponse;
	if (!jsonResponse) return next();

	if (request.query.callback) {
		response.status(200).jsonp(jsonResponse);
	} else {
		response.status(jsonResponse.status).json(jsonResponse);
	}
}

const invalidJsonErrorMessage = [
	"Invalid JSON submitted.",
	"You need to submit a JSON object with an array of postcodes or geolocation objects.",
	"Also ensure that Content-Type is set to application/json"
].join(" ");

const serverErrorMessage = [
	"500 Server Error.",
	"For an urgent fix email support@ideal-postcodes.co.uk.",
	"Alternatively submit an issue at https://github.com/ideal-postcodes/postcodes.io/issues"
].join(" ");

/**
 * Handles Requests that have resulted in an error. Invoked by next(someError)
 */
function errorRenderer (error, request, response, next) {
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
	return response.status(500).json({
		status: 500,
		error: serverErrorMessage
	});	
}

/**
*	Handles requests that have fallen through middleware stack by returning a 404
*/
function notFoundRenderer (request, response) {
	response.status(404).json({
		status: 404, 
		error: "Resource not found"
	});
}

module.exports = app => {
	app.use(jsonApiResponseFilter);
	app.use(jsonApiResponseRenderer);
	app.use(errorRenderer);
	app.use(notFoundRenderer);
};
