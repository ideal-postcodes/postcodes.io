import { Request, Response, NextFunction } from "express";

interface RouteResponse extends Response {
  jsonApiResponse?: any;
}

export { NextFunction as Next, Request, RouteResponse as Response };
