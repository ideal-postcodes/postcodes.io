"use strict";

const request = require("supertest");
const { config, postcodesioApplication } = require("./helper");
const { defaults } = config;
const { assert } = require("chai");

describe("Prometheus /metrics endpoint", () => {
  describe("when no basic auth configuration is provided", () => {
    it("should not expose a metrics endpoint if username missing", done => {
      const cfg = Object.assign({ prometheusPassword: "bar" }, config);
      assert.isUndefined(cfg.prometheusUsername);
      const app = postcodesioApplication(cfg);
      request(app)
        .get("/metrics")
        .expect(404)
        .end(done);
    });
    it("should not expose a metrics endpoint if password missing", done => {
      const cfg = Object.assign({ prometheusUsername: "foo" }, config);
      assert.isUndefined(cfg.prometheusPassword);
      const app = postcodesioApplication(cfg);
      request(app)
        .get("/metrics")
        .expect(404)
        .end(done);
    });
  });

  describe("when basic auth configuration provided", () => {
    const prometheusUsername = "foo";
    const prometheusPassword = "bar";
    it("exposes /metrics behind basic auth", done => {
      const cfg = Object.assign(
        { prometheusUsername, prometheusPassword },
        config
      );
      const app = postcodesioApplication(cfg);
      request(app)
        .get("/metrics")
        .expect(401)
        .end(done);
    });

});
