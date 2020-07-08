"use strict";

const request = require("supertest");
const { assert } = require("chai");
const helper = require("./helper");
const async = require("async");
const app = helper.postcodesioApplication();

describe("Postcodes routes", () => {
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

  after(async () => helper.clearPostcodeDb);

  describe("POST /postcodes", () => {
    let bulkLength = 10;
    let testPostcodes, testLocations;

    describe("Invalid JSON submission", () => {
      it("returns 400 on invalid JSON", (done) => {
        request(app)
          .post("/postcodes")
          .set({ "Content-Type": "application/json" })
          .send("}{")
          .expect("Content-Type", /json/)
          .expect(helper.allowsCORS)
          .expect(400)
          .end((error, response) => {
            if (error) return done(error);
            assert.match(response.body.error, /invalid json submitted/gi);
            done();
          });
      });
    });

    describe("Bulk geocoding", () => {
      beforeEach((done) => {
        async.times(
          bulkLength,
          async (n, next) => {
            const locations = await helper.randomLocation();
            next(null, locations);
          },
          (error, locations) => {
            if (error) return done(error);
            testLocations = locations;
            done();
          }
        );
      });

      it("should return postcodes for specified geolocations", (done) => {
        request(app)
          .post("/postcodes")
          .send({ geolocations: testLocations })
          .expect("Content-Type", /json/)
          .expect(helper.allowsCORS)
          .expect(200)
          .end((error, response) => {
            if (error) return done(error);
            assert.isArray(response.body.result);
            assert.equal(response.body.result.length, bulkLength);
            response.body.result.forEach((lookup) => {
              assert.property(lookup, "query");
              assert.property(lookup, "result");
              assert.isArray(lookup.result);
              lookup.result.forEach((result) =>
                helper.isPostcodeWithDistanceObject(result)
              );
            });
            done();
          });
      });
      it("should return null if no nearby postcode", (done) => {
        request(app)
          .post("/postcodes")
          .send({
            geolocations: [
              {
                longitude: 0,
                latitude: 0,
              },
            ],
          })
          .expect("Content-Type", /json/)
          .expect(helper.allowsCORS)
          .expect(200)
          .end((error, response) => {
            if (error) return done(error);
            assert.equal(response.body.result.length, 1);
            assert.isNull(response.body.result[0].result);
            done();
          });
      });
      it("should refuse request if lookups number over 100", (done) => {
        testLocations = [];
        for (let i = 0; i < 101; i++) {
          testLocations.push("bogus");
        }
        request(app)
          .post("/postcodes")
          .send({ geolocations: testLocations })
          .expect("Content-Type", /json/)
          .expect(helper.allowsCORS)
          .expect(400)
          .end((error, response) => {
            if (error) return done(error);
            assert.match(response.body.error, /too many locations submitted/i);
            done();
          });
      });
      it("should return 404 if invalid geolocations object", (done) => {
        request(app)
          .post("/postcodes")
          .send({ geolocations: "Bogus" })
          .expect("Content-Type", /json/)
          .expect(helper.allowsCORS)
          .expect(400)
          .end((error, response) => {
            if (error) return done(error);
            assert.match(response.body.error, /Invalid data submitted/i);
            done();
          });
      });
      it("is sensitive to limit", (done) => {
        const testLocation = testLocations[0];
        testLocation.limit = 1;
        request(app)
          .post("/postcodes")
          .send({ geolocations: [testLocation] })
          .expect("Content-Type", /json/)
          .expect(helper.allowsCORS)
          .expect(200)
          .end((error, response) => {
            if (error) return done(error);
            assert.equal(response.body.result.length, 1);
            assert.equal(response.body.result[0].result.length, 1);
            helper.isPostcodeWithDistanceObject(
              response.body.result[0].result[0]
            );
            done();
          });
      });
      it("is sensitive to radius", (done) => {
        const testLocation = testLocations[0];
        testLocation.limit = 100;
        testLocation.radius = 100;
        request(app)
          .post("/postcodes")
          .send({ geolocations: [testLocation] })
          .expect("Content-Type", /json/)
          .expect(helper.allowsCORS)
          .expect(200)
          .end((error, response) => {
            if (error) return done(error);
            assert.isTrue(response.body.result[0].result.length > 0);
            const count = response.body.result[0].result.length;
            const query = response.body.result[0].query;
            assert.isDefined(query.limit);
            assert.equal(query.radius, testLocation.radius);
            helper.isPostcodeWithDistanceObject(
              response.body.result[0].result[0]
            );
            testLocation.radius = 1000;
            request(app)
              .post("/postcodes")
              .send({ geolocations: [testLocation] })
              .expect(200)
              .end((error, response) => {
                if (error) return done(error);
                assert.isTrue(response.body.result[0].result.length > count);
                done();
              });
          });
      });
      it("allows wide area searches", (done) => {
        const testLocation = {
          longitude: -2.12659411941741,
          latitude: 57.2465923827836,
          wideSearch: true,
        };
        request(app)
          .post("/postcodes")
          .send({ geolocations: [testLocation] })
          .expect("Content-Type", /json/)
          .expect(helper.allowsCORS)
          .expect(200)
          .end((error, response) => {
            if (error) return done(error);
            assert.equal(response.body.result[0].result.length, 10);
            assert.isTrue(response.body.result[0].query["wideSearch"]);
            assert.isUndefined(response.body.result[0].query["lowerBound"]);
            assert.isUndefined(response.body.result[0].query["upperBound"]);
            done();
          });
      });
      it("allows wide area searches using 'widesearch'", (done) => {
        const testLocation = {
          longitude: -2.12659411941741,
          latitude: 57.2465923827836,
          widesearch: true,
        };
        request(app)
          .post("/postcodes")
          .send({ geolocations: [testLocation] })
          .expect("Content-Type", /json/)
          .expect(helper.allowsCORS)
          .expect(200)
          .end((error, response) => {
            if (error) return done(error);
            assert.equal(response.body.result[0].result.length, 10);
            assert.isTrue(response.body.result[0].query["widesearch"]);
            assert.isUndefined(response.body.result[0].query["lowerBound"]);
            assert.isUndefined(response.body.result[0].query["upperBound"]);
            done();
          });
      });

      it("should return 400 if type of value associated with latitude key is invalid", (done) => {
        const invalidTestLocation = {
          longitude: -2.12659411941741,
          latitude: null,
          widesearch: true,
        };

        request(app)
          .post("/postcodes")
          .send({ geolocations: [invalidTestLocation] })
          .expect("Content-Type", /json/)
          .expect(helper.allowsCORS)
          .expect(400)
          .end((error, response) => {
            if (error) return done(error);
            assert.match(
              response.body.error,
              /Invalid longitude\/latitude submitted/i
            );
            done();
          });
      });

      it("should return 400 if type of value associated with longitude key is invalid", (done) => {
        const invalidTestLocation = {
          longitude: null,
          latitude: 53.5351312861402,
          widesearch: true,
        };

        request(app)
          .post("/postcodes")
          .send({ geolocations: [invalidTestLocation] })
          .expect("Content-Type", /json/)
          .expect(helper.allowsCORS)
          .expect(400)
          .end((error, response) => {
            if (error) return done(error);
            assert.match(
              response.body.error,
              /Invalid longitude\/latitude submitted/i
            );
            done();
          });
      });
    });

    describe("Bulk postcode lookup", () => {
      beforeEach((done) => {
        async.times(
          bulkLength,
          async (n, next) => {
            const postcode = await helper.randomPostcode();
            next(null, postcode);
          },
          (error, postcodes) => {
            if (error) return done(error);
            testPostcodes = postcodes;
            done();
          }
        );
      });

      it("should return addresses for postcodes", (done) => {
        request(app)
          .post("/postcodes")
          .send({ postcodes: testPostcodes })
          .expect("Content-Type", /json/)
          .expect(200)
          .end((error, response) => {
            if (error) return done(error);
            assert.isArray(response.body.result);
            assert.equal(response.body.result.length, bulkLength);
            response.body.result.forEach((lookup) => {
              assert.property(lookup, "query");
              assert.property(lookup, "result");
              helper.isPostcodeObject(lookup.result);
            });
            done();
          });
      });
      it("should return an empty result for non string queries", (done) => {
        request(app)
          .post("/postcodes")
          .send({ postcodes: [null] })
          .expect("Content-Type", /json/)
          .expect(200)
          .end((error, response) => {
            if (error) return done(error);
            assert.isArray(response.body.result);
            assert.equal(response.body.result.length, 0);
            done();
          });
      });
      it("should return a null if postcode not found", (done) => {
        testPostcodes.push("B0GUS");
        request(app)
          .post("/postcodes")
          .send({ postcodes: testPostcodes })
          .expect("Content-Type", /json/)
          .expect(200)
          .end((error, response) => {
            if (error) return done(error);
            assert.equal(response.body.result.length, bulkLength + 1);
            let hasNull = response.body.result.some((l) => l.result === null);
            assert.isTrue(hasNull);
            done();
          });
      });

      it("returns 400 if too many postcodes submitted", (done) => {
        const postcodes = new Array(101).fill().map(() => "foo");
        request(app)
          .post("/postcodes")
          .set({ "Content-Type": "application/json" })
          .send({ postcodes })
          .expect(400)
          .end((error, response) => {
            if (error) return done(error);
            assert.match(response.body.error, /Too many postcodes submitted/gi);
            done();
          });
      });
      it("returns 400 if non-array submitted", (done) => {
        request(app)
          .post("/postcodes")
          .set({ "Content-Type": "application/json" })
          .send({ postcodes: "foo" })
          .expect(400)
          .end((error, response) => {
            if (error) return done(error);
            assert.match(
              response.body.error,
              /You need to provide a JSON array/gi
            );
            done();
          });
      });

      it("should refuse requests if lookups number over 100", (done) => {
        testPostcodes = [];
        for (let i = 0; i < 101; i++) {
          testPostcodes.push("bogus");
        }
        request(app)
          .post("/postcodes")
          .send(testPostcodes)
          .expect("Content-Type", /json/)
          .expect(400)
          .end((error, response) => {
            if (error) return done(error);
            done();
          });
      });
    });

    it("should return a 400 error if array not submitted", (done) => {
      request(app)
        .post("/postcodes")
        .send({ wrong: "dataType" })
        .expect("Content-Type", /json/)
        .expect(400)
        .end((error, response) => {
          if (error) return done(error);
          assert.match(
            response.body.error,
            /ensure that Content-Type is set to application\/json/
          );
          done();
        });
    });
  });
});
