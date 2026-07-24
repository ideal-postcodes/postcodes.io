import { describe, expect, it, vi, beforeEach } from "vitest";
import request from "supertest";
import { config, postcodesioApplication } from "./helper";

const capture = vi.fn();
const shutdown = vi.fn();

vi.mock("posthog-node", () => ({
  PostHog: vi.fn(function (this: any) {
    this.capture = capture;
    this.shutdown = shutdown;
    this.on = vi.fn();
  }),
}));

import { PostHog } from "posthog-node";
import { shutdownPosthog } from "../api/config/posthog";

describe("PostHog monitoring", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when no API key is provided", () => {
    it("does not instantiate a client or capture events", async () => {
      const app = postcodesioApplication({ ...config });
      await request(app).get("/postcodes/foobar");
      expect(PostHog).not.toHaveBeenCalled();
      expect(capture).not.toHaveBeenCalled();
    });
  });

  describe("when an API key is provided", () => {
    const posthogApiKey = "phc_test";
    const posthogHost = "https://eu.i.posthog.com";

    const application = () =>
      postcodesioApplication({ ...config, posthogApiKey, posthogHost });

    it("instantiates a client with key and host", () => {
      application();
      expect(PostHog).toHaveBeenCalledWith(posthogApiKey, {
        host: posthogHost,
      });
    });

    it("captures an event with normalized path", async () => {
      const app = application();
      await request(app).get("/postcodes/foobar");
      expect(capture).toHaveBeenCalledTimes(1);
      const event = capture.mock.calls[0][0];
      expect(event.event).toBe("api_request");
      expect(event.properties.path).toBe("/postcodes/:postcode");
      expect(event.properties.method).toBe("GET");
      expect(event.properties.status).toBe(404);
      expect(event.properties.duration_ms).toBeTypeOf("number");
      expect(event.properties.$process_person_profile).toBe(false);
      expect(event.distinctId).toBeTypeOf("string");
    });

    it("squashes unexpected paths to other", async () => {
      const app = application();
      await request(app).get("/bogus");
      expect(capture).toHaveBeenCalledTimes(1);
      expect(capture.mock.calls[0][0].properties.path).toBe("other");
    });

    it("flushes the client on shutdown", async () => {
      application();
      await shutdownPosthog();
      expect(shutdown).toHaveBeenCalled();
    });
  });
});
