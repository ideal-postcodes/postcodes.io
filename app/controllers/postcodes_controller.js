"use strict";

const async = require("async");
const { isEmpty } = require("../lib/string");
const Postcode = require("../models/postcode");
const Pc = require("postcode");
const { defaults } = require("../../config/config")();
const {
  InvalidPostcodeError,
  PostcodeNotFoundError,
  InvalidJsonQueryError,
  JsonArrayRequiredError,
  ExceedMaxGeolocationsError,
  ExceedMaxPostcodesError,
  PostcodeQueryRequiredError,
  InvalidGeolocationError,
  InvalidLimitError,
  InvalidRadiusError,
} = require("../lib/errors.js");

exports.show = (request, response, next) => {
  const { postcode } = request.params;
  if (!new Pc(postcode.trim()).valid()) return next(new InvalidPostcodeError());

  Postcode.find(postcode, (error, result) => {
    if (error) return next(error);
    if (!result) return next(new PostcodeNotFoundError());
    response.jsonApiResponse = {
      status: 200,
      result: Postcode.toJson(result),
    };
    return next();
  });
};

exports.valid = (request, response, next) => {
  const { postcode } = request.params;

  Postcode.find(postcode, (error, result) => {
    if (error) return next(error);
    response.jsonApiResponse = {
      status: 200,
      result: !!result,
    };
    return next();
  });
};

exports.random = (request, response, next) => {
  Postcode.random(request.query, (error, result) => {
    if (error) return next(error);
    response.jsonApiResponse = {
      status: 200,
      result: result ? Postcode.toJson(result) : null,
    };
    return next();
  });
};

exports.bulk = (request, response, next) => {
  if (request.body.postcodes)
    return bulkLookupPostcodes(request, response, next);
  if (request.body.geolocations) return bulkGeocode(request, response, next);
  return next(new InvalidJsonQueryError());
};

const MAX_GEOLOCATIONS = defaults.bulkGeocode.geolocations.MAX;
const GEO_ASYNC_LIMIT =
  defaults.bulkGeocode.geolocations.ASYNC_LIMIT || MAX_GEOLOCATIONS;

const bulkGeocode = (request, response, next) => {
  const { geolocations } = request.body;

  if (!Array.isArray(geolocations)) return next(new JsonArrayRequiredError());
  if (geolocations.length > MAX_GEOLOCATIONS)
    return next(new ExceedMaxGeolocationsError());

  const lookupGeolocation = (location, callback) => {
    Postcode.nearestPostcodes(location, (error, postcodes) => {
      if (error) return callback(error);
      if (!postcodes) return callback(null, { query: location, result: null });
      callback(null, {
        query: sanitizeQuery(location),
        result: postcodes.map(postcode => Postcode.toJson(postcode)),
      });
    });
  };

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

  async.mapLimit(
    geolocations,
    GEO_ASYNC_LIMIT,
    lookupGeolocation,
    (error, data) => {
      if (error) return next(error);
      response.jsonApiResponse = {
        status: 200,
        result: data,
      };
      return next();
    }
  );
};

const MAX_POSTCODES = defaults.bulkLookups.postcodes.MAX;
const BULK_ASYNC_LIMIT =
  defaults.bulkLookups.postcodes.ASYNC_LIMIT || MAX_POSTCODES;

const bulkLookupPostcodes = (request, response, next) => {
  const postcodes = request.body.postcodes;

  if (!Array.isArray(postcodes)) return next(new JsonArrayRequiredError());
  if (postcodes.length > MAX_POSTCODES)
    return next(new ExceedMaxPostcodesError());

  const lookupPostcode = (postcode, callback) => {
    Postcode.find(postcode, (error, postcodeInfo) => {
      if (error) return callback(error);
      if (!postcodeInfo)
        return callback(null, { query: postcode, result: null });
      callback(null, {
        query: postcode,
        result: Postcode.toJson(postcodeInfo),
      });
    });
  };

  async.mapLimit(postcodes, BULK_ASYNC_LIMIT, lookupPostcode, (error, data) => {
    if (error) return next(error);
    response.jsonApiResponse = {
      status: 200,
      result: data,
    };
    return next();
  });
};

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
  const { limit } = request.query;

  if (isEmpty(postcode)) return next(new PostcodeQueryRequiredError());

  Postcode.search({ postcode, limit }, (error, results) => {
    if (error) return next(error);
    response.jsonApiResponse = {
      status: 200,
      result: results ? results.map(elem => Postcode.toJson(elem)) : null,
    };
    return next();
  });
};

exports.autocomplete = (request, response, next) => {
  const { postcode } = request.params;
  const { limit } = request.query;

  Postcode.search({ postcode, limit }, (error, results) => {
    if (error) return next(error);
    response.jsonApiResponse = {
      status: 200,
      result: !!results ? results.map(elem => elem.postcode) : null,
    };
    return next();
  });
};

const nearestPostcodes = (request, response, next) => {
  const longitude = parseFloat(request.params.longitude);
  const latitude = parseFloat(request.params.latitude);
  let limit, radius;
  const params = {};

  if (isNaN(longitude) || isNaN(latitude))
    return next(new InvalidGeolocationError());
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

  params.wideSearch = !!request.query.wideSearch || !!request.query.widesearch;

  Postcode.nearestPostcodes(params, (error, results) => {
    if (error) return next(error);
    const result = !!results ? results.map(pc => Postcode.toJson(pc)) : null;
    response.jsonApiResponse = { status: 200, result };
    return next();
  });
};

exports.lonlat = nearestPostcodes;

exports.nearest = (request, response, next) => {
  const { postcode } = request.params;

  Postcode.find(postcode, (error, result) => {
    if (error) return next(error);
    if (!result) return next(new PostcodeNotFoundError());
    request.params.longitude = result.longitude;
    request.params.latitude = result.latitude;
    return nearestPostcodes(request, response, next);
  });
};
