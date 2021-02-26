import { Handler } from "../types/express";
import { InvalidGeolocationError } from "../lib/errors";
import { qToString } from "../lib/string";
import { BoundariesResult, inBoundaries } from "../models";

export const boundaries: Handler = async (request, response, next) => {
  const { lat, lng } = request.query;
  try {
    if (lat && lng) {
      const boundaries: BoundariesResult = await inBoundaries({
        lat: qToString(lat),
        lng: qToString(lng),
      });
      response.jsonApiResponse = {
        status: 200,
        result: boundaries,
      };
      return next();
    }

    return next(new InvalidGeolocationError());
  } catch (error) {
    next(error);
  }
};
