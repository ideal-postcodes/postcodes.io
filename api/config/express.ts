import { Config } from "./config";
import express from "express";
import cors from "cors";

export const expressConfig = (app: express.Express, config: Config) => {
  app.enable("trust proxy");
  app.disable("x-powered-by");

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
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
};
