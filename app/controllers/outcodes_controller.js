"use strict";

const Outcode = require("../models/outcode");

exports.query = (request, response, next) => {
	if (request.query.latitude && request.query.longitude) {
		request.params.latitude = request.query.latitude;
		request.params.longitude = request.query.longitude;
		nearestOutcodes(request, response, next);
		return;
	}

	if (request.query.lat && request.query.lon) {
		request.params.latitude = request.query.lat;
		request.params.longitude = request.query.lon;
		nearestOutcodes(request, response, next);
		return;
	}

	response.jsonApiResponse = {
		status: 400,
		error: "Invalid longitude/latitude submitted"
	};
	return next();
};

exports.showOutcode = (request, response, next) => {
	const outcode = request.params.outcode;

	Outcode.find(outcode, (error, result) => {
		if (error) return next(error);
		if (!result) {
			response.jsonApiResponse = {
				status: 404,
				result: null
			};
		} else {
			response.jsonApiResponse = {
				status: 200,
				result: Outcode.toJson(result)
			};
		}
		return next();
	});
};

exports.nearest = (request, response, next) => {
	const outcode = request.params.outcode;

	Outcode.find(outcode, (error, outcode) => {
		if (error) {
			return next(error);
		}

		if (outcode) {
			request.params.longitude = outcode.longitude;
			request.params.latitude = outcode.latitude;
			return nearestOutcodes(request, response, next);
		} else {
			response.jsonApiResponse = {
				status: 404,
				error: "Outcode not found"
			};
			return next();
		}
	});
};

function nearestOutcodes (request, response, next) {
	const longitude = parseFloat(request.params.longitude);
	const latitude = parseFloat(request.params.latitude);
	let limit, radius; 
	const params = {};

	if (isNaN(longitude) || isNaN(latitude)) {
		response.jsonApiResponse = {
			status: 400,
			error: "Invalid longitude/latitude submitted"
		};
		return next();
	} else {
		params.longitude = longitude;
		params.latitude = latitude;
	}

	if (request.query.limit) {
		limit = parseInt(request.query.limit, 10);
		if (isNaN(limit)) {
			response.jsonApiResponse = {
				status: 400,
				error: "Invalid result limit submitted"
			};
			return next();
		} else {
			params.limit = limit;
		}
	}

	if (request.query.radius) {
		radius = parseFloat(request.query.radius);
		if (isNaN(radius)) {
			response.jsonApiResponse = {
				status: 400,
				error: "Invalid lookup radius submitted"
			};
			return next();
		} else {
			params.radius = radius;
		}
	}

	Outcode.nearest(params, (error, results) => {
		if (error) return next(error);
		if (!results) {
			response.jsonApiResponse = {
				status: 200,
				result: null
			};
			return next();
		} else {
			response.jsonApiResponse = {
				status: 200,
				result: results.map(outcode => Outcode.toJson(outcode))
			};
			return next();
		}
	});
}