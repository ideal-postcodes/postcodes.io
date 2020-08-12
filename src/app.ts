import express from "express";
import { Config } from "./config/config";
import logger from "./config/logger";
import { expressConfig } from "./config/express";
import { prometheusConfig } from "./config/prometheus";
import { routes } from "./config/routes";
import { rendererConfig } from "./config/renderer";

export = (config: Config): express.Express => {
  const app = express();
  logger(app, config);
  expressConfig(app, config);
  prometheusConfig(app, config);
  routes(app);
  rendererConfig(app);
  return app;
};
