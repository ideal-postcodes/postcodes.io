"use strict";

const auth = require("express-basic-auth");
const prometheus = require("express-prom-bundle");

// Prometheus configuration
const metricsPath = "/metrics";
const buckets = [0.01, 0.05, 0.1, 0.5, 1, 5];
const promClient = {
  collectDefaultMetrics: {
    timeout: 5000,
  },
};

/**
 * Inserts optional prometheus monitoring middleware
 *
 * express-prom-bundle exposes a '/metrics' endpoint which can be queried by prometheus
 *
 * This endpoint requires basic auth defined by:
 * - PROMETHEUS_USERNAME
 * - PROMETHEUS_PASSWORD
 */
module.exports = (app, { prometheusUsername, prometheusPassword }) => {
  if (prometheusUsername === undefined) return;
  if (prometheusPassword === undefined) return;

  // Apply basic auth middleware
  const users = {};
  users[prometheusUsername] = prometheusPassword;

  app.use(metricsPath, auth({ users, challenge: true }));

  // Apply prometheus middleware
  const prometheusMiddleware = prometheus({
    metricsPath,
    buckets,
    includeMethod: true,
    includePath: true,
    promClient,
  });
  app.use(prometheusMiddleware);
};
