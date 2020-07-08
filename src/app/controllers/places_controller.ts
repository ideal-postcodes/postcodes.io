import { Place } from "../models/place";
import { PlaceNotFoundError, InvalidQueryError } from "../lib/errors";
import { Request, Response, Next } from "../types/express";

export const show = async (
  request: Request,
  response: Response,
  next: Next
) => {
  try {
    const { id } = request.params;
    const place = await Place.findByCode(id.toLowerCase());
    if (!place) return next(new PlaceNotFoundError());
    response.jsonApiResponse = {
      status: 200,
      result: Place.toJson(place),
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
    const place = await Place.random();
    response.jsonApiResponse = {
      status: 200,
      result: Place.toJson(place),
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
): Promise<void> => {
  try {
    const query = request.query.query || request.query.q;
    if (query) {
      await searchPlace(request, response, next);
    } else {
      throw new InvalidQueryError();
    }
  } catch (error) {
    next(error);
  }
};

const returnEmptyResponse = (response: Response, next: Next): void => {
  response.jsonApiResponse = {
    status: 200,
    result: [],
  };
  next();
};

const searchPlace = async (
  request: Request,
  response: Response,
  next: Next
): Promise<void> => {
  try {
    const name: string = <string>request.query.query || <string>request.query.q;
    if (name.trim().length === 0) return returnEmptyResponse(response, next);

    let limit =
      parseInt(<string>request.query.limit, 10) ||
      parseInt(<string>request.query.l, 10);
    //if NAN make it undefined
    if (isNaN(limit)) limit = undefined;

    const places = await Place.search({ name, limit });
    if (!places) return returnEmptyResponse(response, next);
    response.jsonApiResponse = {
      status: 200,
      result: places.map((p) => Place.toJson(p)),
    };
    return next();
  } catch (error) {
    next(error);
  }
};
