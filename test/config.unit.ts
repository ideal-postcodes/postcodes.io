import { configFactory } from "./helper";
import { assert } from "chai";

describe("Config", () => {
  describe("Environment variables", () => {
    const ENV = process.env;

    beforeEach(() => {
      process.env = {};
    });

    after(() => {
      process.env = ENV;
    });

    describe("HTTP_HEADERS", () => {
      it("is undefined by default", () => {
        assert.isUndefined(configFactory().httpHeaders);
      });

      it("assigns httpHeaders", () => {
        const headers = {
          foo: "bar",
          baz: "quux",
        };
        process.env["HTTP_HEADERS"] = JSON.stringify(headers);
        assert.deepEqual(configFactory().httpHeaders, headers);
      });

      it("throws if invalid httpHeader string", () => {
        process.env["HTTP_HEADERS"] = "foo";
        assert.throws(configFactory);
      });
    });
  });
});
