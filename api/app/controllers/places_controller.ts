import { Place } from "../models/place";
import { qToString } from "../lib/string";
import { PlaceNotFoundError, InvalidQueryError } from "../lib/errors";
import { Handler, Response, Next } from "../types/express";

export const show: Handler = async (request, response, next) => {
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

export const random: Handler = async (request, response, next) => {
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

export const query: Handler = (request, response, next) => {
  const q = request.query.query || request.query.q;
  if (!q) return next(new InvalidQueryError());
  searchPlace(request, response, next);
};

const returnEmptyResponse = (response: Response, next: Next): void => {
  response.jsonApiResponse = { status: 200, result: [] };
  next();
};

const searchPlace: Handler = async (request, response, next) => {
  try {
    const name = qToString(request.query.query || request.query.q) || "";
    if (name.trim().length === 0) return returnEmptyResponse(response, next);

    let limit = parseInt(qToString(request.query.limit || request.query.l), 10);
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
