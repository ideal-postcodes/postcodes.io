"use strict";

const Outcode = require("../models/outcode");
const {
  OutcodeNotFoundError,
  InvalidLimitError,
  InvalidRadiusError,
  InvalidGeolocationError,
} = require("../lib/errors.js");

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

  return next(new InvalidGeolocationError());
};

exports.showOutcode = (request, response, next) => {
	const { outcode } = request.params;

	Outcode.find(outcode, (error, result) => {
		if (error) return next(error);
		if (!result) return next(new OutcodeNotFoundError());
    response.jsonApiResponse = {
      status: 200,
      result: Outcode.toJson(result)
    };
		return next();
	});
};

exports.nearest = (request, response, next) => {
	const { outcode } = request.params;

	Outcode.find(outcode, (error, outcode) => {
		if (error) return next(error);
    if (!outcode) return next(new OutcodeNotFoundError());
    request.params.longitude = outcode.longitude;
    request.params.latitude = outcode.latitude;
    return nearestOutcodes(request, response, next);
	});
};

function nearestOutcodes (request, response, next) {
	const longitude = parseFloat(request.params.longitude);
	const latitude = parseFloat(request.params.latitude);
	let limit, radius; 
	const params = {};

	if (isNaN(longitude) || isNaN(latitude)) return next(new InvalidGeolocationError());
  params.longitude = longitude;
  params.latitude = latitude;

	if (request.query.limit) {
		limit = parseInt(request.query.limit, 10);
		if (isNaN(limit)) return next(new InvalidLimitError());
    params.limit = limit;
	}

	if (request.query.radius) {
		radius = parseFloat(request.query.radius);
		if (isNaN(radius)) return next(new InvalidRadiusError());
    params.radius = radius;
	}

	Outcode.nearest(params, (error, results) => {
		if (error) return next(error);
    response.jsonApiResponse = {
      status: 200,
      result: !!results ? results.map(outcode => Outcode.toJson(outcode)) : null,
    };
    return next();
	});
}

