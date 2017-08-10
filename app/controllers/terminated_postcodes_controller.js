"use strict";
const terminatedPostcode = require("../models/terminated_postcode");
const Pc = require("postcode");

exports.show = (request, response, next) => {
	const postcode = request.params.postcode;
	if (!new Pc(postcode).valid()) {
		response.jsonApiResponse = {
			status: 404,
			error: "Invalid postcode"
		};
		return next();
	}
	
	terminatedPostcode.find(postcode, (error, foundPostcode) => {
		if (error) {
			return next(error);
		}
		if (foundPostcode) {
			response.jsonApiResponse = {
				status: 200,
				result: terminatedPostcode.toJson(foundPostcode)
			};
			return next();
		} else {
			response.jsonApiResponse = {
				status: 404,
				error: "Terminated postcode not found"
			};
			return next();
		}
	});
	
};
