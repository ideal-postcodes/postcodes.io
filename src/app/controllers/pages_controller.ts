import appConfig from "../../config/config";
import { Request, Response } from "../types/express";

const config = appConfig();

export const home = (request: Request, response: Response) => {
  response.render("pages/home", {
    ga: config.googleAnalyticsKey,
  });
};

export const documentation = (request: Request, response: Response) => {
  response.render("pages/documentation", {
    ga: config.googleAnalyticsKey,
  });
};

export const about = (request: Request, response: Response) => {
  response.render("pages/about", {
    ga: config.googleAnalyticsKey,
  });
};

export const explore = (request: Request, response: Response) => {
  response.render("pages/explore", {
    ga: config.googleAnalyticsKey,
    mapBoxKey: config.mapBoxKey,
  });
};
