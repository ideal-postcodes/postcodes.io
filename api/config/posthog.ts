import { PostHog } from "posthog-node";
import { Express } from "express";
import { Config } from "./config";
import { normalizePath } from "./prometheus";

let client: PostHog | undefined;

/**
 * Inserts optional PostHog monitoring middleware
 *
 * Captures an `api_request` event per request with the normalized path
 * (e.g. /postcodes/:postcode), method, status code and duration
 *
 * Enabled by defining:
 * - POSTHOG_API_KEY
 * - POSTHOG_HOST (optional, e.g. https://eu.i.posthog.com)
 */
export const posthogConfig = (
  app: Express,
  { posthogApiKey, posthogHost }: Config
): void => {
  if (posthogApiKey === undefined) return;

  client = new PostHog(posthogApiKey, {
    host: posthogHost,
  });
  // Never let telemetry failures surface in the API
  client.on("error", () => {});

  app.use((request, response, next) => {
    const start = process.hrtime.bigint();
    response.on("finish", () => {
      const duration = Number(process.hrtime.bigint() - start) / 1e6;
      client?.capture({
        distinctId: request.ip || "unknown",
        event: "api_request",
        properties: {
          method: request.method,
          path: normalizePath(request),
          status: response.statusCode,
          duration_ms: Math.round(duration * 100) / 100,
          $process_person_profile: false,
        },
      });
    });
    next();
  });
};

/**
 * Flushes queued events and closes the PostHog client
 */
export const shutdownPosthog = async (): Promise<void> => {
  if (client === undefined) return;
  await client.shutdown();
  client = undefined;
};
