"use strict";

const path = require("path");
const request = require("supertest");
const { assert } = require("chai");
const helper = require("./helper");
const jsonResponseTypeRegex = /text\/javascript/;
const app = helper.postcodesioApplication();

describe("Utils with JSONP", () => {
  describe("Ping", () => {
    it("should pong", async () => {
      const { text } = await request(app)
        .get("/ping?callback=foo")
        .expect("Content-Type", /text\/javascript/)
        .expect(200);
      const jsonBody = helper.jsonpResponseBody(text);
      assert.equal(jsonBody.result, "pong");
    });
  });
});

describe("Postcodes routes with JSONP", () => {
  let testPostcode, testOutcode;

  before(async function () {
    this.timeout(0);
    await helper.clearPostcodeDb();
    await helper.seedPostcodeDb();
  });

  beforeEach(async () => {
    const result = await helper.lookupRandomPostcode();
    testPostcode = result.postcode;
    testOutcode = result.outcode;
  });

  after(async () => helper.clearPostcodeDb());

  describe("GET /postcodes", () => {
    let uri, limit;
    it("should return a list of matching postcode objects", async () => {
      uri = encodeURI(
        "/postcodes?q=" +
          testPostcode.replace(" ", "").slice(0, 2) +
          "&callback=foo"
      );
      const { text } = await request(app)
        .get(uri)
        .expect("Content-Type", jsonResponseTypeRegex)
        .expect(200);
      const jsonBody = helper.jsonpResponseBody(text);
      assert.isArray(jsonBody.result);
      assert.equal(jsonBody.result.length, 10);
      jsonBody.result.forEach((pc) => helper.isPostcodeObject(pc));
    });
  });

  describe("GET /postcodes/:postcode", () => {
    it("should return 200 if postcode found", async () => {
      const path = [
        "/postcodes/",
        encodeURI(testPostcode),
        "?callback=foo",
      ].join("");
      const { text } = await request(app)
        .get(path)
        .expect("Content-Type", jsonResponseTypeRegex)
        .expect(200);
      const jsonBody = helper.jsonpResponseBody(text);
      assert.equal(jsonBody.status, 200);
      assert.equal(jsonBody.result.postcode, testPostcode);
      helper.isPostcodeObject(jsonBody.result);
    });
  });

  describe("/outcodes/:outcode", () => {
    it("should return correct geolocation data for a given outcode", async () => {
      const path = ["/outcodes/", encodeURI(testOutcode), "?callback=foo"].join(
        ""
      );
      const { text } = await request(app)
        .get(path)
        .expect("Content-Type", jsonResponseTypeRegex)
        .expect(200);
      const jsonBody = helper.jsonpResponseBody(text);
      assert.equal(jsonBody.status, 200);
      assert.equal(jsonBody.result.outcode, testOutcode);
      assert.property(jsonBody.result, "longitude");
      assert.property(jsonBody.result, "latitude");
      assert.property(jsonBody.result, "northings");
      assert.property(jsonBody.result, "eastings");
    });
  });

  describe("GET /postcodes/:postcode/validate", () => {
    it("should return true if postcode found", async () => {
      const path = [
        "/postcodes/",
        encodeURI(testPostcode),
        "/validate",
        "?callback=foo",
      ].join("");
      const { text } = await request(app)
        .get(path)
        .expect("Content-Type", jsonResponseTypeRegex)
        .expect(200);
      const jsonBody = helper.jsonpResponseBody(text);
      assert.equal(jsonBody.status, 200);
      assert.isTrue(jsonBody.result);
    });
  });

  describe("GET /postcodes/:postcode/nearest", () => {
    it("should return a list of nearby postcodes", async () => {
      const uri = encodeURI("/postcodes/" + testPostcode + "/nearest");

      const { text } = await request(app)
        .get(uri)
        .query({
          callback: "foo",
        })
        .expect(200);
      const jsonBody = helper.jsonpResponseBody(text);
      assert.isArray(jsonBody.result);
      assert.isTrue(jsonBody.result.length > 0);
      jsonBody.result.forEach((pc) => helper.isPostcodeWithDistanceObject(pc));
    });
  });

  describe("GET /random/postcode", () => {
    it("should return a random postcode", async () => {
      const path = "/random/postcodes?callback=foo";
      const { text } = await request(app)
        .get(path)
        .expect("Content-Type", jsonResponseTypeRegex)
        .expect(200);
      const jsonBody = helper.jsonpResponseBody(text);
      assert.property(jsonBody.result, "postcode");
      helper.isPostcodeObject(jsonBody.result);
    });
  });

  describe("GET /postcodes/:postcode/autocomplete", () => {
    let uri, limit;

    it("should return a list of matching postcodes only", async () => {
      uri = encodeURI(
        "/postcodes/" + testPostcode.slice(0, 2) + "/autocomplete?callback=foo"
      );

      const { text } = await request(app)
        .get(uri)
        .expect("Content-Type", jsonResponseTypeRegex)
        .expect(200);
      const jsonBody = helper.jsonpResponseBody(text);
      assert.isArray(jsonBody.result);
      assert.equal(jsonBody.result.length, 10);
      jsonBody.result.forEach((pc) => assert.isString(pc));
    });
  });

  describe("GET /postcodes/lon/:longitude/lat/latitude", () => {
    let loc;

    beforeEach(async () => {
      loc = await helper.locationWithNearbyPostcodes();
    });

    it("should return a list of nearby postcodes", async () => {
      const uri = encodeURI(
        "/postcodes/lon/" +
          loc.longitude +
          "/lat/" +
          loc.latitude +
          "?callback=foo"
      );

      const { text } = await request(app)
        .get(uri)
        .expect("Content-Type", jsonResponseTypeRegex)
        .expect(200);
      const jsonBody = helper.jsonpResponseBody(text);
      assert.isArray(jsonBody.result);
      assert.isTrue(jsonBody.result.length > 0);
      jsonBody.result.forEach((pc) => helper.isPostcodeWithDistanceObject(pc));
      assert.isTrue(
        jsonBody.result.some((elem) => elem.postcode === loc.postcode)
      );
    });
  });
});
