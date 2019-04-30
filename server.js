"use strict";

const config = require("./config/config")();
const app = require("./app")(config);
const { logger } = require("./app/lib/logger");
const { port } = config;

const server = app.listen(port);

server.on("clientError", (error, socket) => {
  if (!socket.destroyed) {
    socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
  }
});

process.on("SIGTERM", () => {
  logger.info("Quitting Postcode API");
  process.exit(0);
});

logger.info(`Postcode API listening on port ${port}`);

module.exports = app;
