import async from "async";
import { isEmpty, toString } from "../lib/string";
import { Postcode } from "../models/postcode";
import Pc from "postcode";
import appConfig from "../../config/config";
import {
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
} from "../lib/errors";
import { Request, Response, Next } from "../types/express";
import { Callback } from "../types/util";

const { defaults } = appConfig();

export const show = async (
  request: Request,
  response: Response,
  next: Next
) => {
  try {
    const { postcode } = request.params;
    if (!new Pc(postcode.trim()).valid()) throw new InvalidPostcodeError();
    const result = await Postcode.find(postcode);
    if (!result) throw new PostcodeNotFoundError();
    response.jsonApiResponse = {
      status: 200,
      result: Postcode.toJson(result),
    };
    next();
  } catch (error) {
    next(error);
  }
};

export const valid = async (
  request: Request,
  response: Response,
  next: Next
) => {
  try {
    const { postcode } = request.params;
    const result = await Postcode.find(postcode);
    response.jsonApiResponse = {
      status: 200,
      result: !!result,
    };
    next();
  } catch (error) {
    next(error);
  }
};

export const random = async (
  request: Request,
  response: Response,
  next: Next
) => {
  try {
    const { outcode } = request.query;
    const result = await Postcode.random(<string>outcode);
    response.jsonApiResponse = {
      status: 200,
      result: result ? Postcode.toJson(result) : null,
    };
    return next();
  } catch (error) {
    next(error);
  }
};

export const bulk = (request: Request, response: Response, next: Next) => {
  if (request.body.postcodes)
    return bulkLookupPostcodes(request, response, next);
  if (request.body.geolocations) return bulkGeocode(request, response, next);
  return next(new InvalidJsonQueryError());
};

const MAX_GEOLOCATIONS = defaults.bulkGeocode.geolocations.MAX;
const GEO_ASYNC_LIMIT =
  defaults.bulkGeocode.geolocations.ASYNC_LIMIT || MAX_GEOLOCATIONS;

const bulkGeocode = async (
  request: Request,
  response: Response,
  next: Next
) => {
  try {
    const { geolocations } = request.body;

    if (!Array.isArray(geolocations)) return next(new JsonArrayRequiredError());
    if (geolocations.length > MAX_GEOLOCATIONS)
      return next(new ExceedMaxGeolocationsError());

    const lookupGeolocation = async (location: any) => {
      const postcodes = await Postcode.nearestPostcodes(location);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (!postcodes) return { query: location, result: null };
      return {
        query: sanitizeQuery(location),
        result: postcodes.map((postcode) => Postcode.toJson(postcode)),
      };
    };

    const whitelist = [
      "limit",
      "longitude",
      "latitude",
      "radius",
      "widesearch",
    ];
    const sanitizeQuery = (query: any) => {
      const result: { [index: string]: any } = {};
      for (const attr in query) {
        if (whitelist.indexOf(attr.toLowerCase()) !== -1) {
          result[attr] = query[attr];
        }
      }
      return result;
    };

    const data = [];
    for (let i = 0; i < GEO_ASYNC_LIMIT; i += 1) {
      if (geolocations[i]) {
        data.push(await lookupGeolocation(geolocations[i]));
      } else {
        break;
      }
    }

    response.jsonApiResponse = {
      status: 200,
      result: data,
    };
    next();
  } catch (error) {
    next(error);
  }
};

const MAX_POSTCODES = defaults.bulkLookups.postcodes.MAX;
const BULK_ASYNC_LIMIT =
  defaults.bulkLookups.postcodes.ASYNC_LIMIT || MAX_POSTCODES;

const bulkLookupPostcodes = async (
  request: Request,
  response: Response,
  next: Next
) => {
  try {
    const postcodes = request.body.postcodes;
    if (!Array.isArray(postcodes)) return next(new JsonArrayRequiredError());
    if (postcodes.length > MAX_POSTCODES)
      return next(new ExceedMaxPostcodesError());
    const lookupPostcode = async (postcode: string) => {
      const postcodeInfo = await Postcode.find(postcode);
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
    response.jsonApiResponse = {
      status: 200,
      result: data,
    };
    next();
  } catch (error) {
    next(error);
  }
};

export const query = async (
  request: Request,
  response: Response,
  next: Next
) => {
  if (request.query.latitude && request.query.longitude) {
    request.params.latitude = <string>request.query.latitude;
    request.params.longitude = <string>request.query.longitude;
    nearestPostcodes(request, response, next);
    return;
  }

  if (request.query.lat && request.query.lon) {
    request.params.latitude = <string>request.query.lat;
    request.params.longitude = <string>request.query.lon;
    nearestPostcodes(request, response, next);
    return;
  }

  const postcode: string =
    <string>request.query.q || <string>request.query.query;
  const { limit } = request.query;

  if (isEmpty(postcode)) return next(new PostcodeQueryRequiredError());

  try {
    const results = await Postcode.search({ limit: <string>limit, postcode });
    response.jsonApiResponse = {
      status: 200,
      result: results ? results.map((elem) => Postcode.toJson(elem)) : null,
    };
    return next();
  } catch (error) {
    next(error);
  }
};

export const autocomplete = async (
  request: Request,
  response: Response,
  next: Next
) => {
  try {
    const { postcode } = request.params;
    const { limit } = request.query;
    const results = await Postcode.search({ postcode, limit: <string>limit });
    response.jsonApiResponse = {
      status: 200,
      result: results ? results.map((elem: any) => elem.postcode) : null,
    };
    next();
  } catch (error) {
    next(error);
  }
};

const nearestPostcodes = async (
  request: Request,
  response: Response,
  next: Next
) => {
  try {
    const longitude = request.params.longitude;
    const latitude = request.params.latitude;
    let limit, radius;
    const params = {
      longitude,
      latitude,
    };

    if (isNaN(parseFloat(longitude)) || isNaN(parseFloat(latitude)))
      return next(new InvalidGeolocationError());
    Object.assign(params, { longitude, latitude });

    if (request.query.limit) {
      limit = parseInt(<string>request.query.limit, 10);
      if (isNaN(limit)) return next(new InvalidLimitError());
      Object.assign(params, { limit });
    }

    if (request.query.radius) {
      radius = parseFloat(<string>request.query.radius);
      if (isNaN(radius)) return next(new InvalidRadiusError());
      Object.assign(params, { radius });
    }
    Object.assign(params, {
      wideSearch: !!request.query.wideSearch || !!request.query.widesearch,
    });

    const results = await Postcode.nearestPostcodes(params);
    const result = results ? results.map((pc) => Postcode.toJson(pc)) : null;
    response.jsonApiResponse = { status: 200, result };
    next();
  } catch (error) {
    next(error);
  }
};

export const lonlat = nearestPostcodes;

export const nearest = async (
  request: Request,
  response: Response,
  next: Next
) => {
  try {
    const { postcode } = request.params;
    const result = await Postcode.find(postcode);
    if (!result) return next(new PostcodeNotFoundError());
    request.params.longitude = toString(result.longitude);
    request.params.latitude = toString(result.latitude);
    return nearestPostcodes(request, response, next);
  } catch (error) {
    next(error);
  }
};
