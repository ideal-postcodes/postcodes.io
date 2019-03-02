"use strict";

const express = require("express");

exports = module.exports = config => {
  const app = express();
  require("./config/logger")(app, config);
  require("./config/db")(config);
  require("./config/express")(app, config);
  require("./config/prometheus")(app, config);
  require("./config/routes")(app);
  require("./config/renderer")(app);
  return app;
};
