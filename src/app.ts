import express from "express";
import logger from "./config/logger";
import db from "./config/db";
import expressConfig from "./config/express";
import prometheus from "./config/prometheus";
import routes from "./config/routes";
import renderer from "./config/renderer";

export = (config: any) => {
  const app = express();
  logger(app, config);
  db();
  expressConfig(app, config);
  prometheus(app, config);
  routes(app);
  renderer(app);
  return app;
};
