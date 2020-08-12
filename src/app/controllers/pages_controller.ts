import { getConfig } from "../../config/config";
import { Handler } from "../types/express";

const config = getConfig();
const ga = config.googleAnalyticsKey;
const mapBoxKey = config.mapBoxKey;

export const home: Handler = (request, response) =>
  response.render("pages/home", { ga });

export const documentation: Handler = (request, response) =>
  response.render("pages/documentation", { ga });

export const about: Handler = (request, response) =>
  response.render("pages/about", { ga });

export const explore: Handler = (request, response) =>
  response.render("pages/explore", { ga, mapBoxKey });
