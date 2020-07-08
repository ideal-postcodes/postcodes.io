"use strict";

/**
 * config.js
 *
 * This file exports default configurations across test, development and
 * production environments. If you wish to modify configuration, please use
 * environment variables or the .env file
 *
 * Nota Bene
 *
 * Whereas previously (<10.1), config.js served as an editable configuration
 * file, post 10.1, configuration should be set via environment variables
 * or the `.env` file - with environment variables taking precedence
 */

// Load .env into environment variables
require("dotenv").config();

const { join } = require("path");
const defaults = require("./defaults");
const defaultEnv = process.env.NODE_ENV || "development";

const config = {
  development: {
    googleAnalyticsKey: "",
    postgres: {
      user: "postcodesio",
      password: "password",
      database: "postcodesiodb", // Database name
      host: "localhost",
      port: 5432,
    },
    log: {
      name: "postcodes.io",
      file: "stdout",
    },
    port: 8000,
    serveStaticAssets: true,
  },

  test: {
    googleAnalyticsKey: "",
    postgres: {
      user: "postcodesio",
      password: "password",
      database: "postcodeio_testing",
      host: "localhost",
      port: 5432,
    },
    log: {
      name: "postcodes.io",
      file: join(__dirname, "../test.log"),
    },
    port: 8000,
    serveStaticAssets: true,
  },

  production: {
    googleAnalyticsKey: "",
    postgres: {
      user: "postcodesio",
      password: "password",
      database: "postcodesiodb",
      host: "localhost",
      port: 5432,
    },
    log: {
      name: "postcodes.io",
      file: "perf", // Use pino.extreme
    },
    port: 8000,
    serveStaticAssets: false,
  },
};

module.exports = (env) => {
  const environment = env || defaultEnv;

  const cfg = config[environment];

  cfg.defaults = defaults;

  const {
    PORT,
    MAPBOX_PUBLIC_KEY,
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    POSTGRES_DATABASE,
    POSTGRES_HOST,
    POSTGRES_PORT,
    LOG_NAME,
    GA_KEY,
    LOG_DESTINATION,
    PROMETHEUS_USERNAME,
    PROMETHEUS_PASSWORD,
    SERVE_STATIC_ASSETS,
    HTTP_HEADERS,
  } = process.env;

  if (PORT !== undefined) cfg.port = PORT;

  if (MAPBOX_PUBLIC_KEY !== undefined || !cfg.mapBoxKey) {
    cfg.mapBoxKey = process.env.MAPBOX_PUBLIC_KEY || "";
  }

  if (POSTGRES_USER !== undefined) cfg.postgres.user = POSTGRES_USER;
  if (POSTGRES_PASSWORD !== undefined)
    cfg.postgres.password = POSTGRES_PASSWORD;
  if (POSTGRES_DATABASE !== undefined)
    cfg.postgres.database = POSTGRES_DATABASE;
  if (POSTGRES_HOST !== undefined) cfg.postgres.host = POSTGRES_HOST;
  if (POSTGRES_PORT !== undefined) cfg.postgres.port = POSTGRES_PORT;

  if (LOG_NAME !== undefined) cfg.log.name = LOG_NAME;
  if (LOG_DESTINATION !== undefined) cfg.log.file = LOG_DESTINATION;

  if (GA_KEY !== undefined) cfg.googleAnalyticsKey = GA_KEY;

  if (PROMETHEUS_USERNAME !== undefined)
    cfg.prometheusUsername = PROMETHEUS_USERNAME;
  if (PROMETHEUS_PASSWORD !== undefined)
    cfg.prometheusPassword = PROMETHEUS_PASSWORD;

  if (SERVE_STATIC_ASSETS !== undefined)
    cfg.serveStaticAssets = SERVE_STATIC_ASSETS.toLowerCase() !== "false";

  try {
    if (HTTP_HEADERS !== undefined) cfg.httpHeaders = JSON.parse(HTTP_HEADERS);
  } catch (error) {
    process.stdout.write(
      "Invalid HTTP Header configuration. Please supply valid JSON string for HTTP_HEADERS"
    );
    throw error;
  }

  return cfg;
};
