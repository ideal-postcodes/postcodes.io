"use strict";

const async = require("async");
const S = require("string");
const Postcode = require("../models/postcode");
const path = require("path");
const env = process.env.NODE_ENV || "development";
const defaults = require(path.join(__dirname, "../../config/config.js"))(env).defaults;

exports.show = (request, response, next) => {
	const postcode = request.params.postcode;

	Postcode.find(postcode, (error, address) => {
		if (error) {
			return next(error);
		}
		if (address) {
			response.jsonApiResponse = {
				status: 200,
				result: Postcode.toJson(address)
			};
			return next();		
		} else {
			response.jsonApiResponse = {
				status: 404,
				error: "Postcode not found"
			};
			return next();
		}
	});
};

exports.valid = (request, response, next) => {
	const postcode = request.params.postcode;
	
	Postcode.find(postcode, (error, address) => {
		if (error) {
			return next(error);
		}

		if (address) {
			response.jsonApiResponse = {
				status: 200,
				result: true
			};		
			return next();
		} else {
			response.jsonApiResponse = {
				status: 200,
				result: false
			};
			return next();		
		}
	});	
};

exports.random = (request, response, next) => {
	Postcode.random(request.query, (error, address) => {
		if (error) {
			return next(error);
		}

		response.jsonApiResponse = {
			status: 200,
			result: address ? Postcode.toJson(address) : null
		};
		return next();
	});
};

const invalidPostMessage = [
	"Invalid JSON submitted.", 
	"You need to submit a JSON object with an array of postcodes or geolocation objects.",
	"Also ensure that Content-Type is set to application/json"
].join(" ");

exports.bulk = (request, response, next) => {
	if (request.body.postcodes) {
		return bulkLookupPostcodes(request, response, next);
	} else if (request.body.geolocations) {
		return bulkGeocode(request, response, next);
	} else {
		response.jsonApiResponse = {
			status: 400,
			error: invalidPostMessage
		};
		return next();
	}
};

function bulkGeocode (request, response, next) {
	const geolocations = request.body.geolocations;

	if (!Array.isArray(geolocations)) {
		response.jsonApiResponse = {
			status: 400,
			error: "Invalid data submitted. You need to provide a JSON array"
		};
		return next();
	}

	const MAX_GEOLOCATIONS = defaults.bulkGeocode.geolocations.MAX;
	if (geolocations.length > MAX_GEOLOCATIONS) {
		response.jsonApiResponse = {
			status: 400,
			error: `Too many locations submitted. Up to ${MAX_GEOLOCATIONS} locations can be bulk requested at a time`
		};
		return next();
	}

	const result = [];
	const execution = [];
	const whitelist = ["limit", "longitude", "latitude", "radius", "widesearch"];
	const sanitizeQuery = query => {
		const result = {};
		for (let attr in query) {
			if (whitelist.indexOf(attr.toLowerCase()) !== -1) {
				result[attr] = query[attr];
			}
		}
		return result;
	};

	geolocations.forEach(location => {
		execution.push(callback => {
			const params = location;

			Postcode.nearestPostcodes(params, (error, postcodes) => {
				if (error || !postcodes) {
					result.push({
						query: location,
						result: null
					});
				} else {
					result.push({
						query: sanitizeQuery(location),
						result: postcodes.map(postcode => Postcode.toJson(postcode))
					});
				}
				callback();
			});

		});
	});

	const onComplete = () => {
		response.jsonApiResponse = {
			status: 200,
			result: result
		};
		return next();
	};

	async.parallel(execution, onComplete);
}

function bulkLookupPostcodes (request, response, next) {
	const postcodes = request.body.postcodes;

	if (!Array.isArray(postcodes)) {
		response.jsonApiResponse = {
			status: 400,
			error: "Invalid data submitted. You need to provide a JSON array"
		};
		return next();
	}

	const MAX_POSTCODES = defaults.bulkLookups.postcodes.MAX;

	if (postcodes.length > MAX_POSTCODES) {
		response.jsonApiResponse = {
			status: 400,
			error: `Too many postcodes submitted. Up to ${MAX_POSTCODES} postcodes can be bulk requested at a time`
		};
		return next();
	}

	const result = [];
	const execution = [];

	postcodes.forEach(postcode => {
		execution.push(callback => {
			Postcode.find(postcode, (error, postcodeInfo) => {
				if (error || !postcodeInfo) {
					result.push({
						query: postcode,
						result: null
					});
				} else {
					result.push({
						query: postcode,
						result: Postcode.toJson(postcodeInfo)
					});
				}
				callback();
			});
		});
	});

	async.parallel(execution, () => {
		response.jsonApiResponse = {
			status: 200,
			result: result
		};
		return next();
	});
}

exports.query = (request, response, next) => {
	if (request.query.latitude && request.query.longitude) {
		request.params.latitude = request.query.latitude;
		request.params.longitude = request.query.longitude;
		nearestPostcodes(request, response, next);
		return;
	}

	if (request.query.lat && request.query.lon) {
		request.params.latitude = request.query.lat;
		request.params.longitude = request.query.lon;
		nearestPostcodes(request, response, next);
		return;
	}

	const postcode = request.query.q || request.query.query;
	const limit = request.query.limit;

	if (S(postcode).isEmpty()) {
		response.jsonApiResponse = {
			status: 400,
			error: "No postcode query submitted. Remember to include query parameter"
		};
		return next();
	}

	Postcode.search({
		postcode: postcode, 
		limit: limit
	}, (error, results) => {
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
				result: results.map(elem => Postcode.toJson(elem))
			};
			return next();
		}
	});
};

exports.autocomplete = (request, response, next) => {
	const postcode = request.params.postcode;
	const limit = request.query.limit;

	Postcode.search({
		postcode: postcode, 
		limit: limit
	}, (error, results) => {
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
				result: results.map(elem => elem.postcode)
			};
			return next();
		}
	});
};

const nearestPostcodes = (request, response, next) => {
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

	params.wideSearch = !!request.query.wideSearch || !!request.query.widesearch;

	Postcode.nearestPostcodes(params, (error, results) => {
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
				result: results.map(postcode => Postcode.toJson(postcode))
			};
			return next();
		}
	});
};

exports.lonlat = nearestPostcodes;

exports.nearest = (request, response, next) => {
	const postcode = request.params.postcode;

	Postcode.find(postcode, (error, address) => {
		if (error) {
			return next(error);
		}

		if (address) {
			request.params.longitude = address.longitude;
			request.params.latitude = address.latitude;
			return nearestPostcodes(request, response, next);
		} else {
			response.jsonApiResponse = {
				status: 404,
				error: "Postcode not found"
			};
			return next();
		}
	});
};
