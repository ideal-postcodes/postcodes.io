"use strict";

const logger = require("commonlog-bunyan").logger;

/**
 * Returns JSON response on behalf of routes that return `response.jsonApiResponse`
 *
 * CORS is enabled at this layer.
 * If JSONP is detected, a 200 response is returned regardless of success.
 *
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

/**
 * Handles Requests that have resulted in an error. Invoked by next(someError)
 */

function errorRenderer (error, request, response, next) {
	/*jshint unused:false */
	let message = `Something went wrong: ${error.message}`;
	
	if (process.env.NODE_ENV !== "test") {
		console.log(error.stack);	
	}
	
	if (process.env.NODE_ENV === "production") {
		message = "500 Server Error. Something went wrong. If you need this fixed urgently please email support@ideal-postcodes.co.uk";
	}

	response.status(500).send(message);
	
	logger.error({error: error});
}

/**
*	Handles requests that have fallen through middleware stack by returning a 404
*/

function notFoundRenderer (request, response) {
	response.status(404).render("404");
}

module.exports = app => {
	app.use(jsonApiResponseRenderer);
	app.use(errorRenderer);
	app.use(notFoundRenderer);
};
