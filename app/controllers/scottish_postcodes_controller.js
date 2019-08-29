"use strict";

const ScottishPostcode = require("../models/scottish_postcode");
const Postcode = require("../models/postcode");
const Pc = require("postcode");
const {
  InvalidPostcodeError,
  PostcodeNotFoundError,
  PostcodeNotInSpdError,
} = require("../lib/errors.js");

exports.show = (request, response, next) => {
  const { postcode } = request.params;
  if (!Pc.isValid(postcode.trim()))
    return next(new InvalidPostcodeError());

  ScottishPostcode.find(postcode, (error, result) => {
    if (error) return next(error);
    if (!result) {
      // The return value of Postcode.find is the return value of the callback
      // see postcode.js lines 186-188
      return Postcode.find(postcode, (gerr, gres) => {
        if (gerr) return next(gerr);
        if (!gres) return next(new PostcodeNotFoundError());
        return next(new PostcodeNotInSpdError());
      });
    }
    response.jsonApiResponse = {
      status: 200,
      result: ScottishPostcode.toJson(result),
    };
    return next();
  });
};
