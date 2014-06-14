/**
 * Returns JSON response on behalf of routes that return `response.jsonApiResponse`
 *
 * CORS is enabled at this layer.
 * If JSONP is detected, a 200 response is returned regardless of success.
 *
 */

function jsonApiResponseRenderer (request, response, next) {
	var jsonResponse = response.jsonApiResponse;
	if (!jsonResponse) return next();

	// Enable CORS
	response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Methods", "GET, POST");
  response.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");

	if (request.query.callback) {
		response.jsonp(200, jsonResponse);
	} else {
		response.json(jsonResponse.status, jsonResponse);
	}
}

/**
 * Handles Requests that have resulted in an error. Invoked by next(someError)
 */

function errorRenderer (error, request, response, next) {
	var message = "Something went wrong: " + error.message;
	
	if (process.env.NODE_ENV !== "test") {
		console.log(error.stack);	
	}
	
	if (process.env.NODE_ENV === "production") {
		message = "500 Error. Oooomph!";
	}

	response.send(500, message);
	
	logger.error({error: error, stack: error.stack});
}

/**
*	Handles requests that have fallen through middleware stack by returning a 404
*/

function notFoundRenderer (request, response) {
	response.status(404).render("404");
}

module.exports = function (app) {
	app.use(jsonApiResponseRenderer);
	app.use(errorRenderer);
	app.use(notFoundRenderer);
}