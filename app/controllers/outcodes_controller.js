"use strict";

var logger = require("commonlog-bunyan");
var async = require("async");
var S = require("string");
var Outcode = require("../models/outcode");
var path = require("path");
var env = process.env.NODE_ENV || "development";
var defaults = require(path.join(__dirname, "../../config/config.js"))(env).defaults;

exports.query = function (request, response, next) {
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

exports.showOutcode = function (request, response, next) {
	var outcode = request.params.outcode;

	Outcode.find(outcode, function (error, result) {
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

function nearestOutcodes (request, response, next) {
	var longitude = parseFloat(request.params.longitude),
			latitude = parseFloat(request.params.latitude),
			limit, radius, params = {};

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

	Outcode.nearest(params, function (error, results) {
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
				result: results.map(function (outcode) {
					return Outcode.toJson(outcode);
				})
			};
			return next();
		}
	});
}