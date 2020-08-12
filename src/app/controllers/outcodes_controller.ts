import { Outcode } from "../models/outcode";
import { qToString } from "../lib/string";
import { Handler } from "../types/express";

import {
  OutcodeNotFoundError,
  InvalidLimitError,
  InvalidRadiusError,
  InvalidGeolocationError,
} from "../lib/errors";

export const query: Handler = (request, response, next): void => {
  const { lat, lon, longitude, latitude } = request.query;

  if (latitude && longitude) {
    request.params.latitude = qToString(latitude);
    request.params.longitude = qToString(longitude);
    nearestOutcodes(request, response, next);
    return;
  }

  if (lat && lon) {
    request.params.latitude = qToString(lat);
    request.params.longitude = qToString(lon);
    nearestOutcodes(request, response, next);
    return;
  }

  return next(new InvalidGeolocationError());
};

export const showOutcode: Handler = async (request, response, next) => {
  try {
    const { outcode } = request.params;

    const result = await Outcode.find(outcode);
    if (!result) return next(new OutcodeNotFoundError());
    response.jsonApiResponse = {
      status: 200,
      result: Outcode.toJson(result),
    };
    next();
  } catch (error) {
    next(error);
  }
};

export const nearest: Handler = async (request, response, next) => {
  try {
    const { outcode } = request.params;
    const result = await Outcode.find(outcode);
    if (!result) return next(new OutcodeNotFoundError());
    request.params.longitude = qToString(result.longitude);
    request.params.latitude = qToString(result.latitude);
    nearestOutcodes(request, response, next);
  } catch (error) {
    next(error);
  }
};

const nearestOutcodes: Handler = async (request, response, next) => {
  try {
    const { longitude, latitude, limit, radius } = request.params;
    const results = await Outcode.nearest({
      longitude,
      latitude,
      limit,
      radius,
    });

    response.jsonApiResponse = {
      status: 200,
      result: results
        ? results.map((outcode: any) => Outcode.toJson(outcode))
        : null,
    };
    next();
  } catch (error) {
    next(error);
  }
};
