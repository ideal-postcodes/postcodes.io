"use strict";

const request = require("supertest");
const { assert } = require("chai");
const {
  postcodesioApplication,
  clearScottishPostcodeDb,
  seedScottishPostcodeDb,
} = require("./helper");
const app = postcodesioApplication();
const Postcode = require("postcode");

const error404Message = "Postcode not found";

describe("Scottish postcode route", () => {
  const testPostcode = "ML11 0GH";

  before(async function () {
    this.timeout(0);
    await clearScottishPostcodeDb();
    await seedScottishPostcodeDb();
  });

  after(async () => clearScottishPostcodeDb());

  describe("/GET /scotland/postcodes/:postcode", () => {
    it("should return 200 if postcode found", (done) => {
      const path = `/scotland/postcodes/${encodeURI(testPostcode)}`;
      request(app)
        .get(path)
        .expect("Content-Type", /json/)
        .expect(200)
        .end((error, response) => {
          if (error) return done(error);
          assert.equal(response.body.status, 200);
          assert.equal(Object.keys(response.body).length, 2);
          done();
        });
    });

    it("returns the correct attributes", (done) => {
      const path = `/scotland/postcodes/${encodeURI(testPostcode)}`;
      request(app)
        .get(path)
        .expect("Content-Type", /json/)
        .expect(200)
        .end((error, response) => {
          if (error) return done(error);
          const { result } = response.body;
          assert.deepEqual(result, {
            codes: {
              scottish_parliamentary_constituency: "S16000090",
            },
            postcode: "ML11 0GH",
            scottish_parliamentary_constituency: "Clydesdale",
          });
          done();
        });
    });

    it("accepts padded postcode", (done) => {
      const postcode = "  " + testPostcode + "  ";
      const path = `/scotland/postcodes/${encodeURI(postcode)}`;
      request(app)
        .get(path)
        .expect("Content-Type", /json/)
        .expect(200)
        .end((error, response) => {
          if (error) return done(error);
          assert.equal(response.body.status, 200);
          const { result } = response.body;
          assert.deepEqual(result, {
            codes: {
              scottish_parliamentary_constituency: "S16000090",
            },
            postcode: "ML11 0GH",
            scottish_parliamentary_constituency: "Clydesdale",
          });
          done();
        });
    });

    it("404 if not a valid postcode according to the postcode module", (done) => {
      const path = `/scotland/postcodes/foo`;
      assert.isFalse(Postcode.isValid("foo"));
      request(app)
        .get(path)
        .expect("Content-Type", /json/)
        .expect(404)
        .end(done);
    });

    it("should return 404 if postcode not found", (done) => {
      const postcode = "ID11QE";
      const path = `/scotland/postcodes/${encodeURI(postcode)}`;
      request(app)
        .get(path)
        .expect("Content-Type", /json/)
        .expect(404)
        .end((error, response) => {
          if (error) return done(error);
          assert.property(response.body, "status");
          assert.equal(response.body.status, 404);
          assert.property(response.body, "error");
          assert.equal(Object.keys(response.body).length, 2);
          assert.equal(response.body.error, error404Message);
          done();
        });
    });

    it("should return error if postcode not found but is found in main database", (done) => {
      const postcode = "M11AD";
      const path = `/scotland/postcodes/${encodeURI(postcode)}`;
      request(app)
        .get(path)
        .expect("Content-Type", /json/)
        .expect(404)
        .end((error, response) => {
          if (error) return done(error);
          assert.property(response.body, "status");
          assert.equal(response.body.status, 404);
          assert.property(response.body, "error");
          assert.equal(Object.keys(response.body).length, 2);
          assert.equal(
            response.body.error,
            "Postcode exists in ONSPD but not in SPD"
          );
          done();
        });
    });
  });
});
