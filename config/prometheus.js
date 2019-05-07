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

const paths = [
  [
    `^/postcodes/(lat|lon)/\\d+(\\.\\d+)?/(lat|lon)/\\d+(\\.\\d+)?$`,
    "/postcodes/lon/:lon/lat/:lat",
  ],
  ["^/postcodes/[^/]+$", "/postcodes/:postcode"],
  ["^/postcodes/.+/validate$", "/postcodes/:postcode/validate"],
  ["^/postcodes/.+/nearest$", "/postcodes/:postcode/nearest"],
  ["^/postcodes/.+/autocomplete$", "/postcodes/:postcode/autocomplete"],
  ["^/outcodes/[^/]+$", "/outcodes/:outcode"],
  ["^/outcodes/.+/nearest$", "/outcodes/:outcode/nearest"],
  ["^/terminated_postcodes/[^/]+$", "/terminated_postcodes/:postcode"],
  ["^/places/[^/]+$", "/places/:code"],
].map(([regex, path]) => [new RegExp(regex, "i"), path]);

/**
 * Squash metrics with dynamic paths into one
 *
 * e.g. /postcodes/sw1a2aa -> /postcodes/:postcode
 */
const normalizePath = request => {
  for (const [regex, path] of paths) {
    if (regex.test(request.path)) return path;
  }
  return "other";
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
    normalizePath,
    metricsPath,
    buckets,
    includeMethod: true,
    includePath: true,
    promClient,
  });
  app.use(prometheusMiddleware);
};
