"use strict";

const terminatedPostcode = require("../models/terminated_postcode");
const Pc = require("postcode");
const {
  InvalidPostcodeError,
  TPostcodeNotFoundError,
} = require("../lib/errors.js");

exports.show = (request, response, next) => {
	const { postcode } = request.params;
	if (!new Pc(postcode.trim()).valid()) return next(new InvalidPostcodeError());
	
	terminatedPostcode.find(postcode, (error, result) => {
		if (error) return next(error);
    if (!result) return next(new TPostcodeNotFoundError());   
    response.jsonApiResponse = {
      status: 200,
      result: terminatedPostcode.toJson(result)
    };
    return next();
	});
};

