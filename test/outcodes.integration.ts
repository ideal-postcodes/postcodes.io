import request from "supertest";
import { assert } from "chai";
import * as helper from "./helper";
import { Done } from "mocha";
const app = helper.postcodesioApplication();

describe("Outcodes routes", () => {
  before(async function () {
    this.timeout(0);
    await helper.clearPostcodeDb();
    await helper.seedPostcodeDb();
  });

  after(async () => helper.clearPostcodeDb);

  describe("GET /outcodes/:outcode", function () {
    const testOutcode = "AB10";
    it("should return correct geolocation data for a given outcode", function (done: Done) {
      const path = ["/outcodes/", encodeURI(testOutcode)].join("");
      request(app)
        .get(path)
        .expect("Content-Type", /json/)
        .expect(helper.allowsCORS)
        .expect(200)
        .end(function (error, response) {
          if (error) return done(error);
          assert.equal(response.body.status, 200);
          assert.equal(response.body.result.outcode, testOutcode);
          assert.isUndefined(response.body.result.id);
          assert.isUndefined(response.body.result.location);
          helper.isOutcodeObject(response.body.result);
          done();
        });
    });
    it("should be case insensitive", function (done: Done) {
      const path = ["/outcodes/", encodeURI(testOutcode.toLowerCase())].join(
        ""
      );
      request(app)
        .get(path)
        .expect("Content-Type", /json/)
        .expect(helper.allowsCORS)
        .expect(200)
        .end(function (error, response) {
          if (error) return done(error);
          assert.equal(response.body.status, 200);
          assert.equal(response.body.result.outcode, testOutcode);
          helper.isOutcodeObject(response.body.result);
          done();
        });
    });
    it("should be space insensitive", function (done: Done) {
      const path = ["/outcodes/", encodeURI(testOutcode + "   ")].join("");
      request(app)
        .get(path)
        .expect("Content-Type", /json/)
        .expect(helper.allowsCORS)
        .expect(200)
        .end(function (error, response) {
          if (error) return done(error);
          assert.equal(response.body.status, 200);
          assert.equal(response.body.result.outcode, testOutcode);
          helper.isOutcodeObject(response.body.result);
          done();
        });
    });
    it("should return 404 for an outcode which does not exist", function (done: Done) {
      const path = ["/outcodes/", encodeURI("DEFINITELYBOGUS")].join("");
      request(app)
        .get(path)
        .expect("Content-Type", /json/)
        .expect(helper.allowsCORS)
        .expect(404)
        .end(function (error, response) {
          if (error) return done(error);
          assert.equal(response.body.status, 404);
          assert.isUndefined(response.body.result);
          assert.equal(response.body.error, "Outcode not found");
          done();
        });
    });
    it("should respond to options", function (done: Done) {
      const path = ["/outcodes/", encodeURI(testOutcode)].join("");
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
  describe("GET /outcodes", function () {
    let loc: any, uri: string;

    beforeEach(function () {
      uri = "/outcodes";
      loc = {
        longitude: -2.09301393644196,
        latitude: 57.1392691975667,
      };
    });

    it("returns a list of nearby postcodes", function (done: Done) {
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
          response.body.result.forEach(function (outcode: any) {
            helper.isOutcodeObject(outcode);
          });
          done();
        });
    });
    it("accepts full spelling of longitude and latitude", function (done: Done) {
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
          response.body.result.forEach(function (outcode: any) {
            helper.isOutcodeObject(outcode);
          });
          done();
        });
    });
    it("returns 400 if longitude is missing", function (done: Done) {
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
    it("returns 400 if latitude is missing", function (done: Done) {
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
    it("is sensitive to distance query", function (done: Done) {
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
              radius: 25000,
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
    it("is sensitive to limit query", function (done: Done) {
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
    it("returns a 400 error if invalid longitude", function (done: Done) {
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
    it("returns a 400 error if invalid latitude", function (done: Done) {
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
    it("returns a 400 error if invalid limit", function (done: Done) {
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
    it("returns a 400 error if invalid distance", function (done: Done) {
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
    it("returns null if no outcodes nearby", function (done: Done) {
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
    it("responds to options", function (done: Done) {
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
