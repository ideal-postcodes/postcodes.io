var logger = require("commonlog-bunyan"),
		async = require("async"),
		Postcode = require("../models/postcode");

exports.show = function (request, response, next) {
	var postcode = request.params.postcode;

	Postcode.find(postcode, function (error, address) {
		if (error) {
			return next(error);
		}
		if (address) {
			response.json(200, {
				status: 200,
				result: Postcode.toJson(address)
			});		
		} else {
			response.jsonp(404, {
				status: 404,
				error: "Postcode not found"
			});		
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
			response.jsonp(200, {
				status: 200,
				result: true
			});		
		} else {
			response.jsonp(200, {
				status: 200,
				result: false
			});		
		}
	});	
}

exports.random = function (request, response, next) {
	Postcode.random(function (error, address) {
		if (error) {
			return next(error);
		}

		response.jsonp(200, {
			status: 200,
			result: Postcode.toJson(address)
		});
	});
}

exports.bulk = function (request, response, next) {
	var postcodes = request.body.postcodes;

	if (!Array.isArray(postcodes)) {
		return response.jsonp(400, {
			status: 400,
			error: "Invalid data submitted. You need to provide a JSON array"
		});
	}

	if (postcodes.length > 100) {
		return response.jsonp(400, {
			status: 400,
			error: "Too many postcodes submitted. Up to 100 postcodes can be bulk requested at a time"
		});
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
		response.jsonp(200, {
			status: 200,
			result: result
		});
	});
}

exports.query = function (request, response, next) {
	var searchTerm = request.query.q || request.query.query;

	if (!searchTerm) {
		response.jsonp(200, {
			status: 400,
			error: "No postcode query submitted. Remember to include query parameter"
		});
	}

	Postcode.search(searchTerm, 10, function (error, results) {
		if (error) return next(error);
		if (!results) {
			response.jsonp(200, {
				status: 200,
				result: null
			});
		} else {
			response.jsonp(200, {
				status: 200,
				result: results.map(function (elem) {
					return Postcode.toJson(elem);
				})
			});
		}
	});
}

exports.autocomplete = function (request, response, next) {
	var searchTerm = request.params.postcode;

	Postcode.search(searchTerm, 10, function (error, results) {
		if (error) return next(error);
		if (!results) {
			response.jsonp(200, {
				status: 200,
				result: null
			});
		} else {
			response.jsonp(200, {
				status: 200,
				result: results.map(function (elem) {
					return elem.postcode;
				})
			});
		}
	});
}

exports.lonlat = function (request, response, next) {
	var longitude = parseFloat(request.params.longitude),
			latitude = parseFloat(request.params.latitude),
			limit, radius, params = {};

	if (isNaN(longitude) || isNaN(latitude)) {
		return response.jsonp(400, {
			status: 404,
			error: "Invalid longitude/latitude submitted"
		});
	} else {
		params.longitude = longitude;
		params.latitude = latitude;
	}

	
	if (request.query.limit) {
		limit = parseInt(request.query.limit, 10);
		if (isNaN(limit)) {
			return response.jsonp(400, {
				status: 404,
				error: "Invalid result limit submitted"
			});
		} else {
			params.limit = limit;
		}
	}

	if (request.query.radius) {
		radius = parseInt(request.query.radius, 10);
		if (isNaN(radius)) {
			return response.jsonp(400, {
				status: 404,
				error: "Invalid lookups radius submitted"
			});
		} else {
			params.radius = radius;
		}
	}

	Postcode.nearestPostcodes(params, function (error, results) {
		if (error) return next(error);
		if (!results) {
			response.jsonp(200, {
				status: 200,
				result: null
			});
		} else {
			response.jsonp(200, {
				status: 200,
				result: results.map(function (postcode) {
					return Postcode.toJson(postcode);
				})
			});
		}
	});
}
