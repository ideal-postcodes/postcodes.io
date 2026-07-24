import { getConfig } from "./config/config";
const config = getConfig();
import App from "./app";
const app = App(config);
import { logger } from "./app/lib/logger";
import { shutdownPosthog } from "./config/posthog";
const { host } = config;
const { port } = config;

const server = app.listen(port, host);

const closeSocket = (_: unknown, socket: any) => {
  if (!socket.destroyed) socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
};
server.on("clientError", closeSocket);
server.on("connect", closeSocket);

process.on("SIGTERM", async () => {
  logger.info("Quitting Postcode API");
  await shutdownPosthog();
  process.exit(0);
});

logger.info(`Postcode API listening on ${host} port ${port}`);

module.exports = app;
