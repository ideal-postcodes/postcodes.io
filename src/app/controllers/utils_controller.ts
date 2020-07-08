import { Request, Response, Next } from "../types/express";

export const ping = (request: Request, response: Response, next: Next) => {
  response.jsonApiResponse = {
    status: 200,
    result: "pong",
  };
  next();
};
