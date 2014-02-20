exports.ping = function (request, response) {
	response.jsonp(200, {
		code: 200,
		result: "pong"
	});
}