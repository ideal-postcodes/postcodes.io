import { isEmpty, qToString } from "../lib/string";
import { Postcode } from "../models/postcode";
import { isValid } from "postcode";
import { chunk } from "../lib/chunk";
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

    if (!isValid(postcode.trim())) throw new InvalidPostcodeError();

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
  try {
    if (request.body.geolocations) return bulkGeocode(request, response, next);
  } catch (err) {
    return next(err);
  }
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

    let globalLimit: string | undefined;
    if (request.query.limit) globalLimit = qToString(request.query.limit);

    let globalRadius: string | undefined;
    if (request.query.radius) globalRadius = qToString(request.query.radius);

    let globalWidesearch: boolean | undefined;
    if (request.query.widesearch) globalWidesearch = true;

    if (!Array.isArray(geolocations)) return next(new JsonArrayRequiredError());
    if (geolocations.length > MAX_GEOLOCATIONS)
      return next(new ExceedMaxGeolocationsError());

    const data: LookupGeolocationResult[] = new Array(geolocations.length);

    const lookupGeolocation = async (
      location: NearestPostcodesOptions,
      i: number
    ): Promise<void> => {
      const postcodes = await Postcode.nearestPostcodes(location);
      let result = null;
      if (postcodes && postcodes.length > 0) {
        result = postcodes.map((postcode) => Postcode.toJson(postcode));
      }
      data[i] = {
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
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(q)) {
        if (whitelist.indexOf(key.toLowerCase()) !== -1) {
          result[key] = value;
        }
      }
      return result;
    };

    const queue = chunk(
      geolocations.map((geolocation, i) => {
        return lookupGeolocation(
          {
            ...(globalLimit && { limit: globalLimit }),
            ...(globalRadius && { radius: globalRadius }),
            ...(globalWidesearch && { widesearch: true }),
            ...geolocation,
          },
          i
        );
      }),
      GEO_ASYNC_LIMIT
    );

    for (const q of queue) await Promise.all(q);

    response.jsonApiResponse = { status: 200, result: data };
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
    if (!Array.isArray(postcodes)) return next(new JsonArrayRequiredError());
    if (postcodes.length > MAX_POSTCODES)
      return next(new ExceedMaxPostcodesError());

    const p = postcodes.filter((pc) => typeof pc === "string");

    const result: BulkLookupPostcodesResult[] = new Array(p.length);

    const lookupPostcode = async (
      postcode: string,
      i: number
    ): Promise<void> => {
      const postcodeInfo = await Postcode.find(postcode);
      if (!postcodeInfo) {
        result[i] = { query: postcode, result: null };
        return;
      }
      result[i] = {
        query: postcode,
        result: Postcode.toJson(postcodeInfo),
      };
    };

    const queue: Promise<void>[][] = chunk(
      p.map(lookupPostcode).filter((pc) => pc !== null),
      BULK_ASYNC_LIMIT
    );

    for (const queries of queue) await Promise.all(queries);

    response.jsonApiResponse = { status: 200, result };
    next();
  } catch (error) {
    next(error);
  }
};

export const query: Handler = async (request, response, next) => {
  request.params.limit = qToString(request.query.limit);
  request.params.radius = qToString(request.query.radius);

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
    const { longitude, latitude, limit, radius } = request.params;

    const results = await Postcode.nearestPostcodes({
      longitude,
      latitude,
      limit,
      radius,
      wideSearch: !!request.query.wideSearch || !!request.query.widesearch,
    });
    const result = results ? results.map((pc) => Postcode.toJson(pc)) : null;
    response.jsonApiResponse = { status: 200, result };
    next();
  } catch (error) {
    next(error);
  }
};

export const lonlat: Handler = async (request, response, next) => {
  try {
    const { limit, radius } = request.query;
    request.params.limit = qToString(limit);
    request.params.radius = qToString(radius);
    return nearestPostcodes(request, response, next);
  } catch (error) {
    next(error);
  }
};

export const nearest: Handler = async (request, response, next) => {
  try {
    const { postcode } = request.params;
    const { limit, radius } = request.query;
    const result = await Postcode.find(postcode);
    if (!result) return next(new PostcodeNotFoundError());
    request.params.longitude = qToString(result.longitude);
    request.params.latitude = qToString(result.latitude);
    request.params.limit = qToString(limit);
    request.params.radius = qToString(radius);
    return nearestPostcodes(request, response, next);
  } catch (error) {
    next(error);
  }
};
