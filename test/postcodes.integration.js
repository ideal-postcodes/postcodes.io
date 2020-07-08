"use strict";

const request = require("supertest");
const { assert } = require("chai");
const helper = require("./helper");
const app = helper.postcodesioApplication();
const async = require("async");

describe("Postcodes routes", function () {
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

  after(async () => {
    await helper.clearPostcodeDb();
  });

  describe("GET /postcodes", function () {
    var uri, limit;

    it("should return a list of matching postcode objects", function (done) {
      uri = encodeURI(
        "/postcodes?q=" + testPostcode.replace(" ", "").slice(0, 2)
      );
      request(app)
        .get(uri)
        .expect("Content-Type", /json/)
        .expect(helper.allowsCORS)
        .expect(200)
        .end(function (error, response) {
          if (error) return done(error);
          assert.isArray(response.body.result);
          assert.equal(response.body.result.length, 10);
          response.body.result.forEach(function (postcode) {
            helper.isPostcodeObject(postcode);
          });
          done();
        });
    });
    it("should be insensitive to case", function (done) {
      uri = encodeURI("/postcodes?q=" + testPostcode.slice(0, 2).toLowerCase());
      request(app)
        .get(uri)
        .expect("Content-Type", /json/)
        .expect(helper.allowsCORS)
        .expect(200)
        .end(function (error, response) {
          if (error) return done(error);
          assert.isArray(response.body.result);
          assert.equal(response.body.result.length, 10);
          response.body.result.forEach(function (postcode) {
            helper.isPostcodeObject(postcode);
          });
          done();
        });
    });
    it("should be insensitive to space", function (done) {
      uri = encodeURI(
        "/postcodes?q=" + testPostcode.slice(0, 2).split("").join(" ")
      );
      request(app)
        .get(uri)
        .expect("Content-Type", /json/)
        .expect(helper.allowsCORS)
        .expect(200)
        .end(function (error, response) {
          if (error) return done(error);
          assert.isArray(response.body.result);
          assert.equal(response.body.result.length, 10);
          response.body.result.forEach(function (postcode) {
            helper.isPostcodeObject(postcode);
          });
          done();
        });
    });
    it("should be sensitive to limit", function (done) {
      limit = 11;
      uri = encodeURI(
        "/postcodes?q=" +
          testPostcode.slice(0, 2).split("").join(" ") +
          "&limit=" +
          limit
      );
      request(app)
        .get(uri)
        .expect("Content-Type", /json/)
        .expect(helper.allowsCORS)
        .expect(200)
        .end(function (error, response) {
          if (error) return done(error);
          assert.isArray(response.body.result);
          assert.equal(response.body.result.length, 11);
          response.body.result.forEach(function (postcode) {
            helper.isPostcodeObject(postcode);
          });
          done();
        });
    });
    it("should max out limit at 100", function (done) {
      limit = 101;
      uri = encodeURI(
        "/postcodes?q=" +
          testPostcode.slice(0, 2).split("").join(" ") +
          "&limit=" +
          limit
      );
      request(app)
        .get(uri)
        .expect("Content-Type", /json/)
        .expect(helper.allowsCORS)
        .expect(200)
        .end(function (error, response) {
          if (error) return done(error);
          assert.isArray(response.body.result);
          assert.equal(response.body.result.length, 100);
          response.body.result.forEach(function (postcode) {
            helper.isPostcodeObject(postcode);
          });
          done();
        });
    });
    it("should set limit to 10 if invalid", function (done) {
      limit = "BOGUS";
      uri = encodeURI(
        "/postcodes?q=" +
          testPostcode.slice(0, 2).split("").join(" ") +
          "&limit=" +
          limit
      );
      request(app)
        .get(uri)
        .expect("Content-Type", /json/)
        .expect(helper.allowsCORS)
        .expect(200)
        .end(function (error, response) {
          if (error) return done(error);
          assert.isArray(response.body.result);
          assert.equal(response.body.result.length, 10);
          response.body.result.forEach(function (postcode) {
            helper.isPostcodeObject(postcode);
          });
          done();
        });
    });
    it("should return 400 if no postcode submitted", function (done) {
      uri = encodeURI("/postcodes?q=");
      request(app)
        .get(uri)
        .expect("Content-Type", /json/)
        .expect(helper.allowsCORS)
        .expect(400)
        .end(function (error, response) {
          if (error) return done(error);
          assert.equal(response.body.status, 400);
          done();
        });
    });
    it("should respond to options", function (done) {
      request(app)
        .options("/postcodes")
        .expect(204)
        .end(function (error, response) {
          if (error) done(error);
          helper.validCorsOptions(response);
          done();
        });
    });
  });

  describe("GET /postcodes/:postcode", function () {
    it("should return 200 if postcode found", function (done) {
      var path = ["/postcodes/", encodeURI(testPostcode)].join("");
      request(app)
        .get(path)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (error, response) {
          if (error) return done(error);
          assert.equal(response.body.status, 200);
          assert.equal(response.body.result.postcode, testPostcode);
          helper.isPostcodeObject(response.body.result);
          done();
        });
    });
    it("should return 404 if not found", function (done) {
      testPostcode = "ID11QE";
      var path = ["/postcodes/", encodeURI(testPostcode)].join("");
      request(app)
        .get(path)
        .expect("Content-Type", /json/)
        .expect(404)
        .end(function (error, response) {
          if (error) return done(error);
          assert.equal(response.body.status, 404);
          assert.match(response.body.error, /postcode not found/i);
          done();
        });
    });
    it("returns invalid postcode if postcode doesn't match format", function (done) {
      testPostcode = "FOO";
      var path = ["/postcodes/", encodeURI(testPostcode)].join("");
      request(app)
        .get(path)
        .expect("Content-Type", /json/)
        .expect(404)
        .end(function (error, response) {
          if (error) return done(error);
          assert.equal(response.body.status, 404);
          assert.match(response.body.error, /invalid postcode/i);
          done();
        });
    });
    it("should respond to options", function (done) {
      var path = ["/postcodes/", encodeURI(testPostcode)].join("");
      request(app)
        .options(path)
        .expect(204)
        .end(function (error, response) {
          if (error) done(error);
          helper.validCorsOptions(response);
          done();
        });
    });
  });

  describe("GET /postcodes/:postcode/validate", function () {
    it("should return true if postcode found", function (done) {
      var path = ["/postcodes/", encodeURI(testPostcode), "/validate"].join("");
      request(app)
        .get(path)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (error, response) {
          if (error) return done(error);
          assert.equal(response.body.status, 200);
          assert.isTrue(response.body.result);
          done();
        });
    });
    it("should return false if postcode not found", function (done) {
      testPostcode = "ID11QE";
      var path = ["/postcodes/", encodeURI(testPostcode), "/validate"].join("");
      request(app)
        .get(path)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (error, response) {
          if (error) return done(error);
          assert.equal(response.body.status, 200);
          assert.isFalse(response.body.result);
          done();
        });
    });
    it("should respond to options", function (done) {
      var path = ["/postcodes/", encodeURI(testPostcode), "/validate"].join("");
      request(app)
        .options(path)
        .expect(204)
        .end(function (error, response) {
          if (error) done(error);
          helper.validCorsOptions(response);
          done();
        });
    });
  });

  describe("GET /random/postcode", function () {
    it("should return a random postcode", function (done) {
      var path = "/random/postcodes";
      request(app)
        .get(path)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (error, response) {
          if (error) return done(error);
          assert.property(response.body.result, "postcode");
          helper.isPostcodeObject(response.body.result);
          done();
        });
    });
    it("should respond to options", function (done) {
      var path = "/random/postcodes";
      request(app)
        .options(path)
        .expect(204)
        .end(function (error, response) {
          if (error) done(error);
          helper.validCorsOptions(response);
          done();
        });
    });
    describe("filtered by outcode", function () {
      it("returns a random postcode within an outcode", function (done) {
        var path = "/random/postcodes";
        var outcode = "AB10";
        request(app)
          .get(path)
          .query({ outcode: outcode })
          .expect("Content-Type", /json/)
          .expect(200)
          .end(function (error, response) {
            if (error) return done(error);
            assert.property(response.body.result, "postcode");
            helper.isPostcodeObject(response.body.result);
            assert.equal(response.body.result.outcode, outcode);
            done();
          });
      });
      it("returns a null for invalid outcode", function (done) {
        var path = "/random/postcodes";
        var outcode = "BOGUS";
        request(app)
          .get(path)
          .query({ outcode: outcode })
          .expect("Content-Type", /json/)
          .expect(200)
          .end(function (error, response) {
            if (error) return done(error);
            assert.isNull(response.body.result);
            done();
          });
      });
    });
  });

  describe("GET /postcodes/:postcode/autocomplete", function () {
    var uri, limit;
    let testPostcode = "AB101AL";

    it("should return a list of matching postcodes only", function (done) {
      uri = encodeURI(
        "/postcodes/" + testPostcode.slice(0, 2) + "/autocomplete"
      );

      request(app)
        .get(uri)
        .expect("Content-Type", /json/)
        .expect(helper.allowsCORS)
        .expect(200)
        .end(function (error, response) {
          if (error) return done(error);
          assert.isArray(response.body.result);
          assert.equal(response.body.result.length, 10);
          response.body.result.forEach(function (postcode) {
            assert.isString(postcode);
          });
          done();
        });
    });
    it("should be insensitive to case", function (done) {
      uri = encodeURI(
        "/postcodes/" + testPostcode.slice(0, 2).toLowerCase() + "/autocomplete"
      );

      request(app)
        .get(uri)
        .expect("Content-Type", /json/)
        .expect(helper.allowsCORS)
        .expect(200)
        .end(function (error, response) {
          if (error) return done(error);
          assert.isArray(response.body.result);
          assert.equal(response.body.result.length, 10);
          response.body.result.forEach(function (postcode) {
            assert.isString(postcode);
          });
          done();
        });
    });
    it("should be insensitive to space", function (done) {
      uri = encodeURI(
        "/postcodes/" +
          testPostcode.slice(0, 2).split("").join(" ") +
          "/autocomplete"
      );

      request(app)
        .get(uri)
        .expect("Content-Type", /json/)
        .expect(helper.allowsCORS)
        .expect(200)
        .end(function (error, response) {
          if (error) return done(error);
          assert.isArray(response.body.result);
          assert.equal(response.body.result.length, 10);
          response.body.result.forEach(function (postcode) {
            assert.isString(postcode);
          });
          done();
        });
    });
    it("should be sensitive to limit", function (done) {
      limit = 11;
      uri = encodeURI(
        "/postcodes/" +
          testPostcode.slice(0, 2).split("").join(" ") +
          "/autocomplete" +
          "?limit=" +
          limit
      );

      request(app)
        .get(uri)
        .expect("Content-Type", /json/)
        .expect(helper.allowsCORS)
        .expect(200)
        .end(function (error, response) {
          if (error) return done(error);
          assert.isArray(response.body.result);
          assert.equal(response.body.result.length, limit);
          response.body.result.forEach(function (postcode) {
            assert.isString(postcode);
          });
          done();
        });
    });
    it("should max limit out at 100", function (done) {
      limit = 101;
      uri = encodeURI(
        "/postcodes/" +
          testPostcode.slice(0, 2).split("").join(" ") +
          "/autocomplete" +
          "?limit=" +
          limit
      );

      request(app)
        .get(uri)
        .expect("Content-Type", /json/)
        .expect(helper.allowsCORS)
        .expect(200)
        .end(function (error, response) {
          if (error) return done(error);
          assert.isArray(response.body.result);
          assert.equal(response.body.result.length, 100);
          response.body.result.forEach(function (postcode) {
            assert.isString(postcode);
          });
          done();
        });
    });
    it("should set limit to 10 if invalid", function (done) {
      limit = "BOGUS";
      uri = encodeURI(
        "/postcodes/" +
          testPostcode.slice(0, 2).split("").join(" ") +
          "/autocomplete" +
          "?limit=" +
          limit
      );

      request(app)
        .get(uri)
        .expect("Content-Type", /json/)
        .expect(helper.allowsCORS)
        .expect(200)
        .end(function (error, response) {
          if (error) return done(error);
          assert.isArray(response.body.result);
          assert.equal(response.body.result.length, 10);
          response.body.result.forEach(function (postcode) {
            assert.isString(postcode);
          });
          done();
        });
    });
    it("should respond to options", function (done) {
      uri = encodeURI(
        "/postcodes/" + testPostcode.slice(0, 2) + "/autocomplete"
      );
      request(app)
        .options(uri)
        .expect(204)
        .end(function (error, response) {
          if (error) done(error);
          helper.validCorsOptions(response);
          done();
        });
    });
  });
});
