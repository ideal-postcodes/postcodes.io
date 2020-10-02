import { isEmpty, qToString } from "../lib/string";
import { Postcode } from "../models/postcode";
import { isValid } from "postcode";
import { getConfig } from "../../config/config";
import {
  InvalidPostcodeError,
  PostcodeNotFoundError,
  InvalidJsonQueryError,
  JsonArrayRequiredError,
  ExceedMaxGeolocationsError,
  ExceedMaxPostcodesError,
  PostcodeQueryRequiredError,
} from "../lib/errors";
import { Handler } from "../types/express";
import {
  PostcodeTuple,
  PostcodeInterface,
  NearestPostcodeTuple,
  NearestPostcodesOptions,
} from "../models/postcode";

const { defaults } = getConfig();

export const show: Handler = async (request, response, next) => {
  try {
    const { postcode } = request.params;

    if (isValid(postcode.trim())) throw new InvalidPostcodeError();

    const result = await Postcode.find(postcode);
    if (!result) throw new PostcodeNotFoundError();
    response.jsonApiResponse = { status: 200, result: Postcode.toJson(result) };
    next();
  } catch (error) {
    next(error);
  }
};

export const valid: Handler = async (request, response, next) => {
  try {
    const { postcode } = request.params;
    const result = await Postcode.find(postcode);
    response.jsonApiResponse = { status: 200, result: !!result };
    next();
  } catch (error) {
    next(error);
  }
};

export const random: Handler = async (request, response, next) => {
  try {
    const { outcode } = request.query;
    const result = await Postcode.random(qToString(outcode));
    response.jsonApiResponse = {
      status: 200,
      result: result ? Postcode.toJson(result) : null,
    };
    return next();
  } catch (error) {
    next(error);
  }
};

export const bulk: Handler = (request, response, next) => {
  if (request.body.postcodes)
    return bulkLookupPostcodes(request, response, next);
  if (request.body.geolocations) return bulkGeocode(request, response, next);
  return next(new InvalidJsonQueryError());
};

const MAX_GEOLOCATIONS = defaults.bulkGeocode.geolocations.MAX;
const GEO_ASYNC_LIMIT =
  defaults.bulkGeocode.geolocations.ASYNC_LIMIT || MAX_GEOLOCATIONS;

interface LookupGeolocationResult {
  query: { [index: string]: unknown };
  result: null | (PostcodeInterface | NearestPostcodeTuple)[];
}

const bulkGeocode: Handler = async (request, response, next) => {
  try {
    const { geolocations } = request.body;

    if (!Array.isArray(geolocations)) return next(new JsonArrayRequiredError());
    if (geolocations.length > MAX_GEOLOCATIONS)
      return next(new ExceedMaxGeolocationsError());

    const lookupGeolocation = async (
      location: NearestPostcodesOptions
    ): Promise<LookupGeolocationResult> => {
      const postcodes = await Postcode.nearestPostcodes(location);
      let result = null;
      //console.log("CHECK POSTCODES", postcodes);
      if (postcodes.length > 0) {
        //console.log("SHOULD MAP");
        result = postcodes.map((postcode) => Postcode.toJson(postcode));
      }
      //console.log("CHECK", result);
      return {
        query: sanitizeQuery(location),
        result,
      };
    };

    const whitelist = [
      "limit",
      "longitude",
      "latitude",
      "radius",
      "widesearch",
    ];

    const sanitizeQuery = (q: NearestPostcodesOptions) => {
      const result: { [index: string]: unknown } = {};
      for (const [key, value] of Object.entries(q)) {
        if (whitelist.indexOf(key.toLowerCase()) !== -1) {
          result[key] = value;
        }
      }
      return result;
    };

    const result = [];
    for (let i = 0; i < GEO_ASYNC_LIMIT; i += 1) {
      if (geolocations[i]) {
        result.push(await lookupGeolocation(geolocations[i]));
      } else {
        break;
      }
    }

    response.jsonApiResponse = { status: 200, result };
    next();
  } catch (error) {
    next(error);
  }
};

const MAX_POSTCODES = defaults.bulkLookups.postcodes.MAX;
const BULK_ASYNC_LIMIT =
  defaults.bulkLookups.postcodes.ASYNC_LIMIT || MAX_POSTCODES;

interface BulkLookupPostcodesResult {
  query: string;
  result: null | PostcodeInterface | NearestPostcodeTuple;
}

const bulkLookupPostcodes: Handler = async (request, response, next) => {
  try {
    const { postcodes } = request.body;
    console.log(postcodes);
    if (!Array.isArray(postcodes)) return next(new JsonArrayRequiredError());
    if (postcodes.length > MAX_POSTCODES)
      return next(new ExceedMaxPostcodesError());

    const lookupPostcode = async (
      postcode: string
    ): Promise<BulkLookupPostcodesResult> => {
      const postcodeInfo = await Postcode.find(postcode);
      console.log("POSTCODE INFO CHECK", postcodeInfo);
      if (!postcodeInfo) return { query: postcode, result: null };
      return {
        query: postcode,
        result: Postcode.toJson(postcodeInfo),
      };
    };

    const data = [];
    for (let i = 0; i < BULK_ASYNC_LIMIT; i += 1) {
      if (postcodes[i] && postcodes[i] !== null) {
        data.push(await lookupPostcode(postcodes[i]));
      } else {
        break;
      }
    }

    response.jsonApiResponse = { status: 200, result: data };
    next();
  } catch (error) {
    next(error);
  }
};

export const query: Handler = async (request, response, next) => {
  if (request.query.latitude && request.query.longitude) {
    request.params.latitude = qToString(request.query.latitude);
    request.params.longitude = qToString(request.query.longitude);
    nearestPostcodes(request, response, next);
    return;
  }

  if (request.query.lat && request.query.lon) {
    request.params.latitude = qToString(request.query.lat);
    request.params.longitude = qToString(request.query.lon);
    nearestPostcodes(request, response, next);
    return;
  }

  const postcode: string = qToString(request.query.q || request.query.query);

  const { limit } = request.query;

  if (isEmpty(postcode)) return next(new PostcodeQueryRequiredError());

  try {
    const results = await Postcode.search({
      limit: qToString(limit),
      postcode,
    });
    response.jsonApiResponse = {
      status: 200,
      result: results ? results.map((elem) => Postcode.toJson(elem)) : null,
    };
    return next();
  } catch (error) {
    next(error);
  }
};

export const autocomplete: Handler = async (request, response, next) => {
  try {
    const results = await Postcode.search({
      postcode: request.params.postcode,
      limit: qToString(request.query.limit),
    });
    response.jsonApiResponse = {
      status: 200,
      result: results
        ? results.map((elem: PostcodeTuple) => elem.postcode)
        : null,
    };
    next();
  } catch (error) {
    next(error);
  }
};

const nearestPostcodes: Handler = async (request, response, next) => {
  try {
    const { longitude, latitude } = request.params;

    let limit, radius;
    if (request.query.limit) limit = qToString(request.query.limit);
    if (request.query.radius) radius = qToString(request.query.radius);

    const results = await Postcode.nearestPostcodes({
      longitude,
      latitude,
      ...(limit && { limit }),
      ...(radius && { radius }),
      wideSearch: !!request.query.wideSearch || !!request.query.widesearch,
    });
    const result = results ? results.map((pc) => Postcode.toJson(pc)) : null;
    response.jsonApiResponse = { status: 200, result };
    next();
  } catch (error) {
    next(error);
  }
};

export const lonlat = nearestPostcodes;

export const nearest: Handler = async (request, response, next) => {
  try {
    const { postcode } = request.params;
    const result = await Postcode.find(postcode);
    if (!result) return next(new PostcodeNotFoundError());
    request.params.longitude = qToString(result.longitude);
    request.params.latitude = qToString(result.latitude);
    return nearestPostcodes(request, response, next);
  } catch (error) {
    next(error);
  }
};
