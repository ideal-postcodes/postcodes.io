import { Handler } from "../types/express";

export const ping: Handler = (request, response, next) => {
  response.jsonApiResponse = {
    status: 200,
    result: "pong",
  };
  next();
};
