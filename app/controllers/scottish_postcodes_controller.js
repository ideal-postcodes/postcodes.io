"use strict";

const ScottishPostcode = require("../models/scottish_postcode");
const Postcode = require("postcode");
const {
  InvalidPostcodeError,
  PostcodeNotFoundError,
} = require("../lib/errors.js");

exports.show = (request, response, next) => {
  const { postcode } = request.params;
  if (!Postcode.isValid(postcode.trim()))
    return next(new InvalidPostcodeError());

  ScottishPostcode.find(postcode, (error, result) => {
    if (error) return next(error);
    if (!result) return next(new PostcodeNotFoundError());
    response.jsonApiResponse = {
      status: 200,
      result: ScottishPostcode.toJson(result),
    };
    return next();
  });
};
