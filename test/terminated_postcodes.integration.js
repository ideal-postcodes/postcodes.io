"use strict";

const request = require("supertest");
const assert = require("chai").assert;
const helper = require("./helper/index");
const app = helper.postcodesioApplication();
const Pc = require("postcode");

const error404Message = "Terminated postcode not found";

describe("Terminated postcode route", () => {
  let testTerminatedPostcode;
  let path;

  before(async function () {
    this.timeout(0);
    await helper.clearTerminatedPostcodesDb();
    await helper.seedTerminatedPostcodeDb();
  });

  beforeEach(async () => {
    const result = await helper.randomTerminatedPostcode();
    testTerminatedPostcode = result.postcode;
  });

  after(async () => helper.clearTerminatedPostcodesDb());

  describe("/GET /terminated_postcodes/:postcode", () => {
    it("should return 200 and only whitelisted attributes if terminated postcode found", (done) => {
      path = `/terminated_postcodes/${encodeURI(testTerminatedPostcode)}`;
      request(app)
        .get(path)
        .expect("Content-Type", /json/)
        .expect(200)
        .end((error, response) => {
          if (error) return done(error);
          assert.equal(response.body.status, 200);
          assert.equal(Object.keys(response.body).length, 2);
          helper.isTerminatedPostcodeObject(response.body.result);
          done();
        });
    });
    it("only returns postcode, month and year of termination, longitude and latitude", (done) => {
      path = `/terminated_postcodes/${encodeURI(testTerminatedPostcode)}`;
      request(app)
        .get(path)
        .expect("Content-Type", /json/)
        .expect(200)
        .end((error, response) => {
          if (error) return done(error);
          const result = response.body.result;
          assert.equal(Object.keys(result).length, 5);
          assert.isDefined(result.postcode);
          assert.isDefined(result.year_terminated);
          assert.isDefined(result.month_terminated);
          assert.isDefined(result.longitude);
          assert.isDefined(result.latitude);
          done();
        });
    });
    it("returns 200 with the correct data if terminated postcode has extra spaces", (done) => {
      testTerminatedPostcode = "  " + testTerminatedPostcode + "  ";
      path = `/terminated_postcodes/${encodeURI(testTerminatedPostcode)}`;
      request(app)
        .get(path)
        .expect("Content-Type", /json/)
        .expect(200)
        .end((error, response) => {
          if (error) return done(error);
          assert.equal(response.body.status, 200);
          assert.equal(Object.keys(response.body).length, 2);
          helper.isTerminatedPostcodeObject(response.body.result);
          done();
        });
    });
    it("errors if legitimate postcode has special characters", (done) => {
      const firstSlice = testTerminatedPostcode.slice(0, 3);
      const secondSlice = testTerminatedPostcode.slice(3);
      const bogusPostcode = `*${firstSlice}*^${secondSlice}£`;
      path = `/terminated_postcodes/"${encodeURI(bogusPostcode)}`;
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
          assert.equal(response.body.error, "Invalid postcode");
          done();
        });
    });
    it("404 if not a valid postcode according to the postcode module", (done) => {
      const firstSlice = testTerminatedPostcode.slice(0, 2);
      const secondSlice = testTerminatedPostcode.slice(2, 4);
      const thirdSlice = testTerminatedPostcode.slice(4);
      testTerminatedPostcode = ` ${firstSlice} ${secondSlice} ${thirdSlice}`;
      path = `"/terminated_postcodes/"${encodeURI(testTerminatedPostcode)}`;
      assert.isTrue(!new Pc(testTerminatedPostcode).valid());
      request(app)
        .get(path)
        .expect("Content-Type", /json/)
        .expect(404)
        .end(() => done());
    });
    it("should return 404 and the correct result if terminated postcode not found", (done) => {
      testTerminatedPostcode = "ID11QE";
      path = `/terminated_postcodes/${encodeURI(testTerminatedPostcode)}`;
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
  });
});
