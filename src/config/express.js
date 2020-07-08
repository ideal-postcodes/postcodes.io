"use strict";

const env = process.env.NODE_ENV || "development";
const favicon = require("serve-favicon");
const bodyParser = require("body-parser");
const express = require("express");
const { join } = require("path");
const cors = require("cors")({
  origin: "*",
  methods: "GET,POST,OPTIONS",
  allowedHeaders: "X-Requested-With, Content-Type, Accept, Origin",
});

module.exports = (app, config) => {
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
  app.use(cors);
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
};
