"use strict";

const { join } = require("path");
const defaults = require("./defaults");
const defaultEnv = process.env.NODE_ENV || "development";

const config = {
  /*
   * Development Environment (Default) Configuration Object ($ node server.js)
   *
   * This is the default environment. i.e. it's the environment config when the
   * server is booted up with `$ node server.js`
   *
   * The only action you need to take here is to add your Postgres credentials.
   * You also need to create the database yourself and pass in the database name.
   * Note that the specified user needs to be a superuser for the import process.
   * You may reduce user privileges after you've imported postcode data
   *
   */

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
  },

  /*
   * Test Environment (Optional, if you want to npm test)
   *
   * Do not use the same Postgres credentials for the test database as your production
   * or development environments as this environment needs to reset the postcode table
   *
   */

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
  },

  /*
   * Production Environment Configuration Object
   *
   * This is the production environment. `$ NODE_ENV=production node server.js`
   *
   */

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
      file: "extreme", // Use pino.extreme
    },
  },
};

module.exports = env => {
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
    LOG_DESTINATION,
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

  return cfg;
};
