import { Env, Config } from "./config";
const env = (process.env.NODE_ENV as Env | undefined) || "development";
import favicon from "serve-favicon";
import bodyParser from "body-parser";
import express from "express";
import { join } from "path";
import cors from "cors";

export const expressConfig = (app: express.Express, config: Config) => {
  app.enable("trust proxy");
  app.disable("x-powered-by");
  app.set("views", join(__dirname, "../../views"));
  app.set("view engine", "ejs");

  if (config.serveStaticAssets) {
    app.use(favicon("public/favicon.ico"));
    app.use(express.static(join(__dirname, "../../public")));
  }

  const { httpHeaders } = config;
  if (httpHeaders) {
    app.use((_, response, next) => {
      response.header(httpHeaders);
      next();
    });
  }

  app.use(
    cors({
      origin: "*",
      methods: "GET,POST,OPTIONS",
      allowedHeaders: "X-Requested-With, Content-Type, Accept, Origin",
    })
  );
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
};
