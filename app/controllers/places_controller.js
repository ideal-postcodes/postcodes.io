"use strict";

const Place = require("../models/place");
const { PlaceNotFoundError, InvalidQueryError } = require("../lib/errors.js");

exports.show = (request, response, next) => {
  const { id } = request.params;
  Place.findByCode(id.toLowerCase(), (error, place) => {
    if (error) return next(error);
    if (!place) return next(new PlaceNotFoundError());
    response.jsonApiResponse = {
      status: 200,
      result: Place.toJson(place),
    };
    next();
  });
};

exports.random = (request, response, next) => {
  Place.random((error, place) => {
    if (error) return next(error);
    response.jsonApiResponse = {
      status: 200,
      result: Place.toJson(place),
    };
    return next();
  });
};

exports.query = (request, response, next) => {
  const query = request.query.query || request.query.q;
  if (query) return searchPlace(request, response, next);
  return next(new InvalidQueryError());
};

const returnEmptyResponse = (response, next) => {
  response.jsonApiResponse = {
    status: 200,
    result: [],
  };
  next();
};

const searchPlace = (request, response, next) => {
  const name = request.query.query || request.query.q;
  if (name.trim().length === 0) return returnEmptyResponse(response, next);

  const limit =
    parseInt(request.query.limit, 10) || parseInt(request.query.l, 10);

  Place.search({ name, limit }, (error, places) => {
    if (error) return next(error);
    if (!places) return returnEmptyResponse(response, next);
    response.jsonApiResponse = {
      status: 200,
      result: places.map(p => Place.toJson(p)),
    };
    return next();
  });
};
