import { Handler, Request, Response } from "../app/types/express";
import { getConfig } from "../config/config";
const config = getConfig();

const whitelistedAttributes = new Set(config.defaults.filterableAttributes);

const isObject = (o: unknown) =>
  Object.prototype.toString.call(o) === "[object Object]";
const isArray = (o: unknown): o is unknown[] =>
  Object.prototype.toString.call(o) === "[object Array]";

/**
 * Filters an object with valid filters in the filterArray returns an Object
 */
const objFilter = (obj: any, allowed: string[]): any => {
  return allowed.reduce((acc: any, curr) => {
    if (obj[curr] !== undefined) acc[curr] = obj[curr];
    return acc;
  }, {});
};

/**
 * Filters an array of objects with objFilter returns an Array
 */
const arrFilter = (arr: any[], allowed: string[]): any[] =>
  arr.map((obj) => objFilter(obj, allowed));

/**
 * Test if query response requires filtering
 */
const requiresFilter = (request: Request, response: Response): boolean => {
  const jsonResponse = response.jsonApiResponse;
  return jsonResponse && request.query.filter && jsonResponse.status === 200;
};

/**
 * Extracts an array of filterable attributes from request.query.filter and
 * elimates any attributes if not part of whitelist
 */
const filterArray = (request: Request): string[] =>
  (request.query.filter as string)
    .replace(/\s/g, "")
    .toLowerCase()
    .split(",")
    .filter((e) => whitelistedAttributes.has(e));

interface RequestFilter {
  (response: Response, allowed: string[]): void;
}
/**
 * Filters(mutates) response result objects for the POST /postcodes route,
 * detects whether query is a bulk postcode or geolocation request and
 * filters response accordingly
 */
const postRequestFilter: RequestFilter = (response, allowed) => {
  response.jsonApiResponse.result.forEach((obj: any) => {
    if (isObject(obj.result)) {
      obj.result = objFilter(obj.result, allowed);
    } else if (isArray(obj.result)) {
      obj.result = arrFilter(obj.result, allowed);
    }
  });
};

const filterMapper: Record<string, RequestFilter> = {
  "/postcodes": postRequestFilter,
};

/**
 * Express middleware which applies a response filter to whitelisted routes
 */
export const filter: Handler = (request, response, next) => {
  if (!requiresFilter(request, response)) return next();
  const filteredArray = filterArray(request);
  const f = filterMapper[request.route.path];

  if (f) f(response, filteredArray);
  return next();
};
