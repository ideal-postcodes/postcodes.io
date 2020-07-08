"use strict";

const request = require("supertest");
const { assert } = require("chai");
const helper = require("./helper");
const app = helper.postcodesioApplication();
const async = require("async");

describe("Postcodes routes", () => {
  let testPostcode;

  before(async function () {
    this.timeout(0);
    await helper.clearPostcodeDb();
    await helper.seedPostcodeDb();
  });

  beforeEach(async () => {
    const result = await helper.lookupRandomPostcode();
    testPostcode = result.postcode;
  });

  after(async () => helper.clearPostcodeDb);

  describe("GET /postcodes/lon/:longitude/lat/latitude", () => {
    let loc;

    beforeEach(async () => {
      loc = await helper.locationWithNearbyPostcodes();
    });

    it("should return a list of nearby postcodes", (done) => {
      const uri = encodeURI(
        `/postcodes/lon/${loc.longitude}/lat/${loc.latitude}`
      );

      request(app)
        .get(uri)
        .expect("Content-Type", /json/)
        .expect(helper.allowsCORS)
        .expect(200)
        .end(function (error, response) {
          if (error) return done(error);
          assert.isArray(response.body.result);
          assert.isTrue(response.body.result.length > 0);
          response.body.result.forEach((postcode) => {
            helper.isPostcodeWithDistanceObject(postcode);
          });
          assert.isTrue(
            response.body.result.some((elem) => {
              return elem.postcode === loc.postcode;
            })
          );
          done();
        });
    });
    it("should be sensitive to distance query", (done) => {
      var uri = encodeURI(
        "/postcodes/lon/" + loc.longitude + "/lat/" + loc.latitude
      );
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
    it("should be sensitive to limit query", (done) => {
      var uri = encodeURI(
        "/postcodes/lon/" + loc.longitude + "/lat/" + loc.latitude
      );
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
    it("should throw a 400 error if invalid longitude", (done) => {
      var uri = encodeURI("/postcodes/lon/" + "BOGUS" + "/lat/" + loc.latitude);
      request(app)
        .get(uri)
        .expect(400)
        .end(function (error, response) {
          if (error) return done(error);
          done();
        });
    });
    it("should throw a 400 error if invalid latitude", (done) => {
      var uri = encodeURI(
        "/postcodes/lon/" + loc.longitude + "/lat/" + "BOGUS"
      );
      request(app)
        .get(uri)
        .expect(400)
        .end(function (error, response) {
          if (error) return done(error);
          done();
        });
    });
    it("should throw a 400 error if invalid limit", (done) => {
      var uri = encodeURI(
        "/postcodes/lon/" + loc.longitude + "/lat/" + loc.latitude
      );
      request(app)
        .get(uri)
        .query({
          limit: "BOGUS",
        })
        .expect(400)
        .end(function (error, response) {
          if (error) return done(error);
          done();
        });
    });
    it("should throw a 400 error if invalid distance", (done) => {
      var uri = encodeURI(
        "/postcodes/lon/" + loc.longitude + "/lat/" + loc.latitude
      );
      request(app)
        .get(uri)
        .query({
          radius: "BOGUS",
        })
        .expect(400)
        .end(function (error, response) {
          if (error) return done(error);
          done();
        });
    });
    it("returns null if no postcodes nearby", (done) => {
      var uri = encodeURI("/postcodes/lon/0/lat/0");
      request(app)
        .get(uri)
        .expect(200)
        .end(function (error, response) {
          if (error) done(error);
          assert.isNull(response.body.result);
          done();
        });
    });
    it("should respond to options", (done) => {
      var uri = encodeURI(
        "/postcodes/lon/" + loc.longitude + "/lat/" + loc.latitude
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

  describe("GET /postcodes?lon=:longitude&lat=:latitude", function () {
    var loc, uri;

    beforeEach(async () => {
      uri = "/postcodes/";
      loc = await helper.locationWithNearbyPostcodes();
    });

    it("returns a list of nearby postcodes", (done) => {
      request(app)
        .get(uri)
        .query({
          lon: loc.longitude,
          lat: loc.latitude,
        })
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
          assert.isTrue(
            response.body.result.some(function (elem) {
              return elem.postcode === loc.postcode;
            })
          );
          done();
        });
    });
    it("accepts full spelling of longitude and latitude", (done) => {
      request(app)
        .get(uri)
        .query({
          longitude: loc.longitude,
          latitude: loc.latitude,
        })
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
          assert.isTrue(
            response.body.result.some(function (elem) {
              return elem.postcode === loc.postcode;
            })
          );
          done();
        });
    });
    it("falls back to a postcode query if longitude is missing", (done) => {
      request(app)
        .get(uri)
        .query({
          latitude: loc.latitude,
        })
        .expect("Content-Type", /json/)
        .expect(helper.allowsCORS)
        .expect(400)
        .end(function (error, response) {
          if (error) return done(error);
          assert.equal(response.body.status, 400);
          done();
        });
    });
    it("falls back to a postcode query if latitude is missing", (done) => {
      request(app)
        .get(uri)
        .query({
          longitude: loc.longitude,
        })
        .expect("Content-Type", /json/)
        .expect(helper.allowsCORS)
        .expect(400)
        .end(function (error, response) {
          if (error) return done(error);
          assert.equal(response.body.status, 400);
          done();
        });
    });
    it("is sensitive to distance query", (done) => {
      request(app)
        .get(uri)
        .query({
          lon: loc.longitude,
          lat: loc.latitude,
        })
        .expect(200)
        .end(function (error, firstResponse) {
          if (error) return done(error);
          request(app)
            .get(uri)
            .query({
              lon: loc.longitude,
              lat: loc.latitude,
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
    it("is sensitive to limit query", (done) => {
      request(app)
        .get(uri)
        .query({
          lon: loc.longitude,
          lat: loc.latitude,
          limit: 1,
        })
        .expect(200)
        .end(function (error, response) {
          if (error) return done(error);
          assert.equal(response.body.result.length, 1);
          done();
        });
    });
    it("returns a 400 error if invalid longitude", (done) => {
      request(app)
        .get(uri)
        .query({
          lon: "BOGUS",
          lat: loc.latitude,
        })
        .expect(400)
        .end(function (error, response) {
          if (error) return done(error);
          done();
        });
    });
    it("returns a 400 error if invalid latitude", (done) => {
      request(app)
        .get(uri)
        .query({
          lon: loc.longitude,
          lat: "BOGUS",
        })
        .expect(400)
        .end(function (error, response) {
          if (error) return done(error);
          done();
        });
    });
    it("returns a 400 error if invalid limit", (done) => {
      request(app)
        .get(uri)
        .query({
          lon: loc.longitude,
          lat: loc.latitude,
          limit: "BOGUS",
        })
        .expect(400)
        .end(function (error, response) {
          if (error) return done(error);
          done();
        });
    });
    it("returns a 400 error if invalid distance", (done) => {
      request(app)
        .get(uri)
        .query({
          lon: loc.longitude,
          lat: loc.latitude,
          radius: "BOGUS",
        })
        .expect(400)
        .end(function (error, response) {
          if (error) return done(error);
          done();
        });
    });
    it("returns null if no postcodes nearby", (done) => {
      var uri = encodeURI("/postcodes");
      request(app)
        .get(uri)
        .query({
          lat: 0,
          lon: 0,
        })
        .expect(200)
        .end(function (error, response) {
          if (error) done(error);
          assert.isNull(response.body.result);
          done();
        });
    });
    it("responds to options", (done) => {
      request(app)
        .options(uri)
        .expect(204)
        .end(function (error, response) {
          if (error) done(error);
          helper.validCorsOptions(response);
          done();
        });
    });
    describe("Wide Area Searches", function () {
      var longitude, latitude;
      beforeEach(function () {
        longitude = -2.12659411941741;
        latitude = 57.2465923827836;
      });
      it("allows search over a larger area", (done) => {
        request(app)
          .get("/postcodes")
          .query({
            longitude: longitude,
            latitude: latitude,
            wideSearch: true,
          })
          .expect("Content-Type", /json/)
          .expect(helper.allowsCORS)
          .expect(200)
          .end(function (error, response) {
            if (error) return done(error);
            assert.equal(response.body.result.length, 10);
            done();
          });
      });

      it("allows search over a larger area using 'widesearch'", (done) => {
        request(app)
          .get("/postcodes")
          .query({
            longitude: longitude,
            latitude: latitude,
            widesearch: true,
          })
          .expect("Content-Type", /json/)
          .expect(helper.allowsCORS)
          .expect(200)
          .end(function (error, response) {
            if (error) return done(error);
            assert.equal(response.body.result.length, 10);
            done();
          });
      });

      it("does not allow limit to exceed 10", (done) => {
        request(app)
          .get("/postcodes")
          .query({
            longitude: longitude,
            latitude: latitude,
            limit: 100,
            wideSearch: true,
          })
          .expect("Content-Type", /json/)
          .expect(helper.allowsCORS)
          .expect(200)
          .end(function (error, response) {
            if (error) return done(error);
            assert.equal(response.body.result.length, 10);
            done();
          });
      });

      it("does allows limit to be below 10", (done) => {
        request(app)
          .get("/postcodes")
          .query({
            longitude: longitude,
            latitude: latitude,
            limit: 1,
            wideSearch: true,
          })
          .expect("Content-Type", /json/)
          .expect(helper.allowsCORS)
          .expect(200)
          .end(function (error, response) {
            if (error) return done(error);
            assert.equal(response.body.result.length, 1);
            done();
          });
      });
    });
  });
});
