"use strict";

exports.ping = (request, response, next) => {
	response.jsonApiResponse = {
		status: 200,
		result: "pong"
	};
	next();
};
