import { Express } from "express";
import { getConfig } from "./config/config";
const config = getConfig();
import App from "./app";
const app = App(config);
import { logger } from "./app/lib/logger";
const { port } = config;

const server = app.listen(port);

const closeSocket = (_: unknown, socket: any) => {
  if (!socket.destroyed) socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
};
server.on("clientError", closeSocket);
server.on("connect", closeSocket);

process.on("SIGTERM", () => {
  logger.info("Quitting Postcode API");
  process.exit(0);
});

logger.info(`Postcode API listening on port ${port}`);

module.exports = app;
