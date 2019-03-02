"use strict";

const morgan = require("morgan");

module.exports = (app, config) => {
  const logger = require("../app/lib/logger").configure(config);

  const stream = {
    write: message => logger.info(message.slice(0, -1)),
  };

  app.pcioLogger = logger;

  app.use(morgan("combined", { stream }));
};
