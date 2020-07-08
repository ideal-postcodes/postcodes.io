import auth from "express-basic-auth";
import prometheus from "express-prom-bundle";
import { Express, Request } from "express";
import { Config } from "./config";

// Prometheus configuration
const metricsPath = "/metrics";
const buckets = [0.01, 0.05, 0.1, 0.5, 1, 5];
const promClient = {
  collectDefaultMetrics: {},
};

const paths: [RegExp, string][] = [
  [
    "^/postcodes/(lat|lon)/\\d+(\\.\\d+)?/(lat|lon)/\\d+(\\.\\d+)?$",
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
].map<[RegExp, string]>(([regex, path]) => [new RegExp(regex, "i"), path]);

/**
 * Squash metrics with dynamic paths into one
 *
 * e.g. /postcodes/sw1a2aa -> /postcodes/:postcode
 */
const normalizePath = (request: Request): string => {
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
export const prometheusConfig = (
  app: Express,
  { prometheusUsername, prometheusPassword }: Config
): void => {
  if (prometheusUsername === undefined) return;
  if (prometheusPassword === undefined) return;

  // Apply basic auth middleware
  app.use(
    metricsPath,
    auth({
      users: {
        [prometheusUsername]: prometheusPassword,
      },
      challenge: true,
    })
  );

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
