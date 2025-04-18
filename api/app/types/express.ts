import { Request, Response, NextFunction } from "express";

interface RouteResponse extends Response {
  jsonApiResponse?: any;
}

export { NextFunction as Next, Request, RouteResponse as Response };

export interface Handler {
  (request: Request, response: RouteResponse, next: NextFunction): void;
}
