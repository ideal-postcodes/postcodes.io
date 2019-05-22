"use strict";

const { configFactory } = require("./helper");
const { assert } = require("chai");

describe("Config", () => {
  describe("Environment variables", () => {
    const ENV = process.env;

    beforeEach(() => {
      process.env = {};
    });

    after(() => {
      process.env = ENV;
    });

    describe("SERVE_STATIC_ASSET", () => {
      it("enables serveStaticAssets", () => {
        process.env["SERVE_STATIC_ASSETS"] = "true";
        assert.isTrue(configFactory().serveStaticAssets);
      });

      it("disables serveStaticAssets", () => {
        process.env["SERVE_STATIC_ASSETS"] = "false";
        assert.isFalse(configFactory().serveStaticAssets);
      });

      it("defaults to true for unknown input", () => {
        process.env["SERVE_STATIC_ASSETS"] = "foo";
        assert.isTrue(configFactory().serveStaticAssets);
      });
    });
  });
});
