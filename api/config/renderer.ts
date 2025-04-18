import { Express } from "express";
import { logger } from "../app/lib/logger";
import { filter } from "./filter";
import { Handler, Response, Request, Next } from "../app/types/express";
import {
  PostcodesioHttpError,
  InvalidJsonError,
  NotFoundError,
} from "../app/lib/errors";

const genericError = new PostcodesioHttpError();
const invalidJsonError = new InvalidJsonError();
const notFoundError = new NotFoundError();

/**
 * Returns JSON response on behalf of routes that return `response.jsonApiResponse`
 *
 * CORS is enabled at this layer.
 * If JSONP is detected, a 200 response is returned regardless of success.
 */
const renderer: Handler = (request, response, next) => {
  const jsonResponse = response.jsonApiResponse;
  if (!jsonResponse) return next();
  if (request.query.callback) return response.status(200).jsonp(jsonResponse);
  return response.status(jsonResponse.status).json(jsonResponse);
};

/**
 * Applies an instance of PostcodesioHttpError to a response
 */
const applyError = (res: Response, err: PostcodesioHttpError) =>
  res.status(err.status).json(err.toJSON());

/**
 * Handles Requests that have resulted in an error. Invoked by next(someError)
 */
const errorRenderer = (
  error: Error,
  request: Request,
  response: Response,
  next: Next
) => {
  /*jshint unused: false */
  logger.error({ error: error.message });

  //check if bodyParser.json() fails to parse JSON request
  if (
    error instanceof SyntaxError &&
    (error as any).status === 400 &&
    request.method === "POST"
  )
    return applyError(response, invalidJsonError);

  if (error instanceof PostcodesioHttpError) return applyError(response, error);

  // Return 500 for all other errors
  return applyError(response, genericError);
};

/**
 *	Handles requests that have fallen through middleware stack by returning a 404
 */
const notFoundRenderer = (_: unknown, res: Response) =>
  applyError(res, notFoundError);

export const rendererConfig = (app: Express) => {
  app.use(filter);
  app.use(renderer);
  app.use(errorRenderer);
  app.use(notFoundRenderer);
};
