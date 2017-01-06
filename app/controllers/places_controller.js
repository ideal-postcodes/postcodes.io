"use strict";

const logger = require("commonlog-bunyan");
const async = require("async");
const S = require("string");
const Place = require("../models/place");
const path = require("path");
const env = process.env.NODE_ENV || "development";
const configPath = path.join(__dirname, "../../config/config.js");
const defaults = require(configPath)(env).defaults;
const searchDefaults = defaults.placesSearch;
const containsDefaults = defaults.placesContained;

exports.show = (request, response, next) => {
	const id = request.params.id;
	Place.findByCode(id.toLowerCase(), (error, place) => {
		if (error) return next(error);
		if (place) {
			response.jsonApiResponse = {
				status: 200,
				result: Place.toJson(place)
			};
		} else {
			response.jsonApiResponse = {
				status: 404,
				error: "Place not found"
			};
		}
		next();
	});
};

exports.random = (request, response, next) => {
	Place.random((error, place) => {
		if (error) return next(error);
		response.jsonApiResponse = {
			status: 200,
			result: Place.toJson(place)
		}
		return next();
	});
};

exports.query = (request, response, next) => {
	const query = request.query.query || request.query.q;
	if (query) {
		searchPlace(request, response, next);
		return;
	}

	response.jsonApiResponse = {
		status: 400,
		error: "No valid query submitted. Remember to include query parameter"
	};

	return next();
};

const setEmptyResponse = response => {
	response.jsonApiResponse = {
		status: 200,
		result: []
	};
};

const searchPlace = (request, response, next) => {
	const name = request.query.query || request.query.q;
	if (name.trim().length === 0) {
		setEmptyResponse(response);
		return next();
	}

	let limit = parseInt(request.query.limit, 10) 
		|| parseInt(request.query.l, 10) 
		|| searchDefaults.limit.DEFAULT;

	if (isNaN(limit) || limit < 1) limit = searchDefaults.limit.DEFAULT;

	Place.search({
		name: name,
		limit: limit
	}, (error, places) => {
		if (error) return next(error);
		if (!places) {
			setEmptyResponse(response);
			return next();
		}
		response.jsonApiResponse = {
			status: 200,
			result: places.map(p => Place.toJson(p))
		}
		return next();
	});
};
