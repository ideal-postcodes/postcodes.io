"use strict";

const request = require("supertest");
const { config, postcodesioApplication } = require("./helper");
const { defaults } = config;
const { assert } = require("chai");
const promClient = require("prom-client");

describe("Prometheus /metrics endpoint", () => {
  afterEach(() => {
    promClient.register.clear();
  });

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
    let app, getMetrics;

    beforeEach(() => {
      const cfg = Object.assign(
        { prometheusUsername, prometheusPassword },
        config
      );
      app = postcodesioApplication(cfg);
      getMetrics = () =>
        request(app)
          .get("/metrics")
          .expect(200)
          .auth(prometheusUsername, prometheusPassword);
    });

    it("exposes /metrics behind basic auth", done => {
      request(app)
        .get("/metrics")
        .expect(401)
        .end(done);
    });

    const testMetric = (url, expectedMetric) => {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await generateMetric(url);
          const { text } = await getMetrics();
          assert.notInclude(text, url);
          assert.include(text, expectedMetric);
          return resolve();
        } catch(err) {
          return reject(err);
        }
      });
    };

    /**
     * Generates metric for URL, swallows any error
     */
    const generateMetric = url => {
      return new Promise(async resolve => {
        try {
          const response = await request(app).get(url);
          resolve(response);
        } catch (error) {
          // When database is not instantiated,
          // requesting data will generally return errors like 404
          resolve(error);
        }
      });
    };

    describe("URL normalisation", () => {
      it("normalises /postcodes?q=[query]", async () => {
        const url = "/postcodes?q=foobar";
        const expectedMetric = "/postcodes/query/:query";
        await testMetric(url, expectedMetric);
      });

      it("normalises /postcodes/:postcode", async () => {
        const url = "/postcodes/foobar";
        const expectedMetric = "/postcodes/:postcode";
        await testMetric(url, expectedMetric);
      });

      it("normalises /scotland/postcodes/:postcode", async () => {
        const url = "/scotland/postcodes/foobar";
        const expectedMetric = "/scotland/postcodes/:postcode";
        await testMetric(url, expectedMetric);
      });

      it("normalises /postcodes/lon/:longitude/lat/:latitude", async () => {
        const url = "/postcodes/lon/12.1/lat/8";
        const expectedMetric = "/postcodes/lon/:lon/lat/:lat";
        await testMetric(url, expectedMetric);
      });

      it("normalises /postcodes/lon/:longitude/lat/:latitude", async () => {
        const url = "/postcodes/lat/12.1/lon/8.2";
        const expectedMetric = "/postcodes/lon/:lon/lat/:lat";
        await testMetric(url, expectedMetric);
      });

      it("normalises /postcodes?lon=:longitude&lat=:latitude", async () => {
        const url = "/postcodes?lon=12.1&lat=8.2";
        const expectedMetric = "/postcodes/lon/:lon/lat/:lat";
        await testMetric(url, expectedMetric);
      });

      it("normalises /postcodes/:postcode/validate", async () => {
        const url = "/postcodes/foobar/validate";
        const expectedMetric = "/postcodes/:postcode/validate";
        await testMetric(url, expectedMetric);
      });

      it("normalises /postcodes/:postcode/nearest", async () => {
        const url = "/postcodes/foobar/nearest";
        const expectedMetric = "/postcodes/:postcode/nearest";
        await testMetric(url, expectedMetric);
      });

      it("normalises /postcodes/:postcode/autocomplete", async () => {
        const url = "/postcodes/foobar/autocomplete";
        const expectedMetric = "/postcodes/:postcode/autocomplete";
        await testMetric(url, expectedMetric);
      });

      it("normalises /outcodes/:outcode", async () => {
        const url = "/outcodes/foo";
        const expectedMetric = "/outcodes/:outcode";
        await testMetric(url, expectedMetric);
      });

      it("normalises /outcodes/:outcode/nearest", async () => {
        const url = "/outcodes/foo/nearest";
        const expectedMetric = "/outcodes/:outcode/nearest";
        await testMetric(url, expectedMetric);
      });

      it("normalises /outcodes?lon=:longitude&lat=:latitude", async () => {
        const url = "/outcodes?lon=12.1&lat=8.2";
        const expectedMetric = "/outcodes/lon/:lon/lat/:lat";
        await testMetric(url, expectedMetric);
      });

      it("normalises /terminated_postcodes/:postcode", async () => {
        const url = "/terminated_postcodes/foobar";
        const expectedMetric = "/terminated_postcodes/:postcode";
        await testMetric(url, expectedMetric);
      });

      it("normalises /places/:code", async () => {
        const url = "/places/foobar";
        const expectedMetric = "/places/:code";
        await testMetric(url, expectedMetric);
      });

      it("normalises /PLACES/:code", async () => {
        const url = "/PLACES/foobar";
        const expectedMetric = "/places/:code";
        await testMetric(url, expectedMetric);
      });

      it("does not generate metrics for unexpected paths", async () => {
        const url = "/bogus";
        const expectedMetric = "other";
        await testMetric(url, expectedMetric);
      });
    });

    describe("URL normalisation with callback", () => {
      it("normalises /postcodes?q=[query]", async () => {
        const url = "/postcodes?q=foobar&callback=foo";
        const expectedMetric = "/postcodes/query/:query";
        await testMetric(url, expectedMetric);
      });

      it("normalises /postcodes/:postcode", async () => {
        const url = "/postcodes/foobar&callback=foo";
        const expectedMetric = "/postcodes/:postcode";
        await testMetric(url, expectedMetric);
      });

      it("normalises /scotland/postcodes/:postcode", async () => {
        const url = "/scotland/postcodes/foobar&callback=foo";
        const expectedMetric = "/scotland/postcodes/:postcode";
        await testMetric(url, expectedMetric);
      });

      it("normalises /postcodes/lon/:longitude/lat/:latitude", async () => {
        const url = "/postcodes/lon/12.1/lat/8?callback=foo";
        const expectedMetric = "/postcodes/lon/:lon/lat/:lat";
        await testMetric(url, expectedMetric);
      });

      it("normalises /postcodes/lon/:longitude/lat/:latitude", async () => {
        const url = "/postcodes/lat/12.1/lon/8.2?callback=foo";
        const expectedMetric = "/postcodes/lon/:lon/lat/:lat";
        await testMetric(url, expectedMetric);
      });

      it("normalises /postcodes?lon=:longitude&lat=:latitude", async () => {
        const url = "/postcodes?lon=12.1&lat=8.2&callback=foo";
        const expectedMetric = "/postcodes/lon/:lon/lat/:lat";
        await testMetric(url, expectedMetric);
      });

      it("normalises /postcodes/:postcode/validate", async () => {
        const url = "/postcodes/foobar/validate?callback=foo";
        const expectedMetric = "/postcodes/:postcode/validate";
        await testMetric(url, expectedMetric);
      });

      it("normalises /postcodes/:postcode/nearest", async () => {
        const url = "/postcodes/foobar/nearest?callback=foo";
        const expectedMetric = "/postcodes/:postcode/nearest";
        await testMetric(url, expectedMetric);
      });

      it("normalises /postcodes/:postcode/autocomplete", async () => {
        const url = "/postcodes/foobar/autocomplete?callback=foo";
        const expectedMetric = "/postcodes/:postcode/autocomplete";
        await testMetric(url, expectedMetric);
      });

      it("normalises /outcodes/:outcode", async () => {
        const url = "/outcodes/foo?callback=foo";
        const expectedMetric = "/outcodes/:outcode";
        await testMetric(url, expectedMetric);
      });

      it("normalises /outcodes/:outcode/nearest", async () => {
        const url = "/outcodes/foo/nearest?callback=foo";
        const expectedMetric = "/outcodes/:outcode/nearest";
        await testMetric(url, expectedMetric);
      });

      it("normalises /outcodes?lon=:longitude&lat=:latitude", async () => {
        const url = "/outcodes?lon=12.1&lat=8.2&callback=foo";
        const expectedMetric = "/outcodes/lon/:lon/lat/:lat";
        await testMetric(url, expectedMetric);
      });

      it("normalises /terminated_postcodes/:postcode", async () => {
        const url = "/terminated_postcodes/foobar?callback=foo";
        const expectedMetric = "/terminated_postcodes/:postcode";
        await testMetric(url, expectedMetric);
      });

      it("normalises /places/:code", async () => {
        const url = "/places/foobar?callback=foo";
        const expectedMetric = "/places/:code";
        await testMetric(url, expectedMetric);
      });

      it("normalises /PLACES/:code", async () => {
        const url = "/PLACES/foobar?callback=foo";
        const expectedMetric = "/places/:code";
        await testMetric(url, expectedMetric);
      });

      it("does not generate metrics for unexpected paths", async () => {
        const url = "/bogus?callback=foo";
        const expectedMetric = "other";
        await testMetric(url, expectedMetric);
      });
    });

  });
});
