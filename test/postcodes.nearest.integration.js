"use strict";

const helper = require("./helper");
const request = require("supertest");
const app = helper.postcodesioApplication();
const { assert } = require("chai");
const async = require("async");

describe("Postcodes routes", function () {
  let testPostcode, testOutcode;

  before(async () => {
    this.timeout(0);
    await helper.clearPostcodeDb();
    await helper.seedPostcodeDb();
  });

  beforeEach(async () => {
    const result = await helper.lookupRandomPostcode();
    testPostcode = result.postcode;
    testOutcode = result.outcode;
  });

  after(async () => helper.clearPostcodeDb);

  describe("GET /postcodes/:postcode/nearest", function () {
    it("should return a list of nearby postcodes", function (done) {
      const uri = encodeURI("/postcodes/" + testPostcode + "/nearest");

      request(app)
        .get(uri)
        .expect("Content-Type", /json/)
        .expect(helper.allowsCORS)
        .expect(200)
        .end(function (error, response) {
          if (error) return done(error);
          assert.isArray(response.body.result);
          assert.isTrue(response.body.result.length > 0);
          response.body.result.forEach(function (postcode) {
            helper.isPostcodeWithDistanceObject(postcode);
          });
          done();
        });
    });
    it("should be sensitive to distance query", function (done) {
      const uri = encodeURI("/postcodes/" + testPostcode + "/nearest");

      request(app)
        .get(uri)
        .expect(200)
        .end(function (error, firstResponse) {
          if (error) return done(error);
          request(app)
            .get(uri)
            .query({
              radius: 2000,
            })
            .expect(200)
            .end(function (error, secondResponse) {
              if (error) return done(error);
              assert.isTrue(
                secondResponse.body.result.length >=
                  firstResponse.body.result.length
              );
              done();
            });
        });
    });

    it("should be sensitive to limit query", function (done) {
      const uri = encodeURI("/postcodes/" + testPostcode + "/nearest");

      request(app)
        .get(uri)
        .query({
          limit: 1,
        })
        .expect(200)
        .end(function (error, response) {
          if (error) return done(error);
          assert.equal(response.body.result.length, 1);
          done();
        });
    });

    it("should throw a 400 error if invalid limit", function (done) {
      const uri = encodeURI("/postcodes/" + testPostcode + "/nearest");

      request(app)
        .get(uri)
        .query({
          limit: "bogus",
        })
        .expect(400)
        .end(function (error, response) {
          if (error) return done(error);
          assert.equal(response.body.error, "Invalid result limit submitted");
          done();
        });
    });

    it("should throw a 400 error if invalid distance", function (done) {
      const uri = encodeURI("/postcodes/" + testPostcode + "/nearest");

      request(app)
        .get(uri)
        .query({
          radius: "bogus",
        })
        .expect(400)
        .end(function (error, response) {
          if (error) return done(error);
          assert.equal(response.body.error, "Invalid lookup radius submitted");
          done();
        });
    });

    it("should respond to options", function (done) {
      const uri = encodeURI("/postcodes/" + testPostcode + "/nearest");

      request(app)
        .options(uri)
        .expect(204)
        .end(function (error, response) {
          if (error) done(error);
          helper.validCorsOptions(response);
          done();
        });
    });

    it("should return 404 if postcode not found", function (done) {
      const testPostcode = "ID11QE";
      const path = ["/postcodes/", encodeURI(testPostcode), "/nearest"].join(
        ""
      );
      request(app)
        .get(path)
        .expect("Content-Type", /json/)
        .expect(404)
        .end(function (error, response) {
          if (error) return done(error);
          assert.equal(response.body.error, "Postcode not found");
          done();
        });
    });
  });
});
