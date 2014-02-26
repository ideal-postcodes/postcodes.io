exports.ping = function (request, response, next) {
	response.jsonApiResponse = {
		status: 200,
		result: "pong"
	};
	next();
}