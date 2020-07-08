import { Outcode } from "../models/outcode";
import { toString } from "../lib/string";
import { Request, Response, Next } from "../types/express";

import {
  OutcodeNotFoundError,
  InvalidLimitError,
  InvalidRadiusError,
  InvalidGeolocationError,
} from "../lib/errors";

export const query = (
  request: Request,
  response: Response,
  next: Next
): void => {
  if (request.query.latitude && request.query.longitude) {
    request.params.latitude = <string>request.query.latitude;
    request.params.longitude = <string>request.query.longitude;
    nearestOutcodes(request, response, next);
    return;
  }

  if (request.query.lat && request.query.lon) {
    request.params.latitude = <string>request.query.lat;
    request.params.longitude = <string>request.query.lon;
    nearestOutcodes(request, response, next);
    return;
  }

  return next(new InvalidGeolocationError());
};

export const showOutcode = async (
  request: Request,
  response: Response,
  next: Next
) => {
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

export const nearest = async (
  request: Request,
  response: Response,
  next: Next
) => {
  try {
    const { outcode } = request.params;
    const outCode = await Outcode.find(outcode);
    if (!outCode) return next(new OutcodeNotFoundError());
    request.params.longitude = toString(outCode.longitude);
    request.params.latitude = toString(outCode.latitude);
    nearestOutcodes(request, response, next);
  } catch (error) {
    next(error);
  }
};

const nearestOutcodes = async (
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

    const results = await Outcode.nearest(params);
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
