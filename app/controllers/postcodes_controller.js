"use strict";

var logger = require("commonlog-bunyan");
var async = require("async");
var S = require("string");
var Postcode = require("../models/postcode");
var path = require("path");
var env = process.env.NODE_ENV || "development";
var defaults = require(path.join(__dirname, "../../config/config.js"))(env).defaults;

exports.show = function (request, response, next) {
	var postcode = request.params.postcode;

	Postcode.find(postcode, function (error, address) {
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
}

exports.valid = function (request, response, next) {
	var postcode = request.params.postcode;
	
	Postcode.find(postcode, function (error, address) {
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
}

exports.random = function (request, response, next) {
	Postcode.random(function (error, address) {
		if (error) {
			return next(error);
		}

		response.jsonApiResponse = {
			status: 200,
			result: Postcode.toJson(address)
		};
		return next();
	});
}

exports.bulk = function (request, response, next) {
	if (request.body.postcodes) {
		return bulkLookupPostcodes(request, response, next);
	} else if (request.body.geolocations) {
		return bulkGeocode(request, response, next);
	} else {
		response.jsonApiResponse = {
			status: 400,
			error: "Invalid JSON submitted. You need to submit a JSON object with an array of postcodes or geolocation objects"
		};
		return next();
	}
}

function bulkGeocode (request, response, next) {
	var geolocations = request.body.geolocations;

	if (!Array.isArray(geolocations)) {
		response.jsonApiResponse = {
			status: 400,
			error: "Invalid data submitted. You need to provide a JSON array"
		};
		return next();
	}

	var MAX_GEOLOCATIONS = defaults.bulkGeocode.geolocations.MAX;
	if (geolocations.length > MAX_GEOLOCATIONS) {
		response.jsonApiResponse = {
			status: 400,
			error: "Too many locations submitted. Up to " + MAX_GEOLOCATIONS + " locations can be bulk requested at a time"
		};
		return next();
	}

	var result = [];
	var execution = [];
	var whitelist = ["limit", "longitude", "latitude", "radius", "widesearch"];
	var sanitizeQuery = function (query) {
		var result = {};
		for (var attr in query) {
			if (whitelist.indexOf(attr.toLowerCase()) !== -1) {
				result[attr] = query[attr];
			}
		}
		return result;
	}

	geolocations.forEach(function (location) {
		execution.push(function (callback) {
			var params = location;

			Postcode.nearestPostcodes(params, function (error, postcodes) {
				if (error || !postcodes) {
					result.push({
						query: location,
						result: null
					});
				} else {
					result.push({
						query: sanitizeQuery(location),
						result: postcodes.map(function (postcode) {
							return Postcode.toJson(postcode)
						})
					});
				}
				callback();
			});

		});
	});

	var onComplete = function () {
		response.jsonApiResponse = {
			status: 200,
			result: result
		};
		return next();
	}

	async.parallel(execution, onComplete);
}

function bulkLookupPostcodes (request, response, next) {
	var postcodes = request.body.postcodes;

	if (!Array.isArray(postcodes)) {
		response.jsonApiResponse = {
			status: 400,
			error: "Invalid data submitted. You need to provide a JSON array"
		};
		return next();
	}

	var MAX_POSTCODES = defaults.bulkLookups.postcodes.MAX;

	if (postcodes.length > MAX_POSTCODES) {
		response.jsonApiResponse = {
			status: 400,
			error: "Too many postcodes submitted. Up to " + MAX_POSTCODES + " postcodes can be bulk requested at a time"
		};
		return next();
	}

	var result = [],
			execution = [];

	postcodes.forEach(function (postcode) {
		execution.push(function (callback) {
			Postcode.find(postcode, function (error, postcodeInfo) {
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

	async.parallel(execution, function () {
		response.jsonApiResponse = {
			status: 200,
			result: result
		};
		return next();
	});
}

exports.query = function (request, response, next) {
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

	var searchTerm = request.query.q || request.query.query,
			limit = request.query.limit;

	if (S(searchTerm).isEmpty()) {
		response.jsonApiResponse = {
			status: 400,
			error: "No postcode query submitted. Remember to include query parameter"
		};
		return next();
	}

	Postcode.search(searchTerm, {limit: limit}, function (error, results) {
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
				result: results.map(function (elem) {
					return Postcode.toJson(elem);
				})
			};
			return next();
		}
	});
}

exports.autocomplete = function (request, response, next) {
	var searchTerm = request.params.postcode,
			limit = request.query.limit;

	Postcode.search(searchTerm, {limit: limit}, function (error, results) {
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
				result: results.map(function (elem) {
					return elem.postcode;
				})
			};
			return next();
		}
	});
}

var nearestPostcodes = function (request, response, next) {
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

	params.wideSearch = !!request.query.wideSearch || !!request.query.widesearch;

	Postcode.nearestPostcodes(params, function (error, results) {
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
				result: results.map(function (postcode) {
					return Postcode.toJson(postcode);
				})
			};
			return next();
		}
	});
};
exports.lonlat = nearestPostcodes;

exports.nearest = function (request, response, next) {
	var postcode = request.params.postcode;

	Postcode.find(postcode, function (error, address) {
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
	})
};