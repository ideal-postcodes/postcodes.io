import request from "supertest";
import { assert } from "chai";
import * as helper from "./helper";
import async from "async";
const app = helper.postcodesioApplication();

describe("Postcodes routes", () => {
  before(async function () {
    this.timeout(0);
    await helper.clearPostcodeDb();
    await helper.seedPostcodeDb();
  });

  beforeEach(async () => {
    await helper.lookupRandomPostcode();
  });

  after(async () => helper.clearPostcodeDb);

  describe("POST /postcodes", () => {
    const bulkLength = 12;
    let testPostcodes: any, testLocations: any;

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
          async (_, next) => {
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
            response.body.result.forEach((lookup: any) => {
              assert.property(lookup, "query");
              assert.property(lookup, "result");
              assert.isArray(lookup.result);
              lookup.result.forEach((result: any) =>
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
        const testLocation = {
          longitude: -2.084524,
          latitude: 57.129475,
          limit: 1,
        };
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

      it("is sensitive to limit set in query string", (done) => {
        const testLocation = {
          longitude: -2.084524,
          latitude: 57.129475,
        };
        request(app)
          .post("/postcodes?limit=1")
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
      it("overrides global limit with local", (done) => {
        const testLocation = {
          longitude: -2.084524,
          latitude: 57.129475,
          limit: 2,
        };
        request(app)
          .post("/postcodes?limit=1")
          .send({ geolocations: [testLocation] })
          .expect("Content-Type", /json/)
          .expect(helper.allowsCORS)
          .expect(200)
          .end((error, response) => {
            if (error) return done(error);
            assert.equal(response.body.result.length, 1);
            assert.equal(response.body.result[0].result.length, 2);
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

      it("returns searches in order", async () => {
        const geolocations = [
          {
            longitude: -2.084524,
            latitude: 57.129475,
          },
          {
            longitude: -2.014524,
            latitude: 57.129475,
          },
          {
            longitude: -2.024524,
            latitude: 57.129475,
          },
        ];
        const response = await request(app)
          .post("/postcodes")
          .send({ geolocations })
          .expect(200);
        for (let i = 0; i < geolocations.length; i += 1) {
          assert.equal(
            geolocations[i].longitude,
            response.body.result[i].query.longitude
          );
        }
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
        const invalidTestLocation: any = {
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
        const invalidTestLocation: any = {
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
          async (_, next) => {
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

      it("returns results in order", async () => {
        const postcodes = [
          "YO31 6EG",
          "HG3 3EX",
          "CH65 6RW",
          "CH6Z 6RW",
          "N1 1SJ",
          "BT36 5NS",
        ];
        const response = await request(app)
          .post("/postcodes")
          .send({ postcodes })
          .expect(200);
        for (let i = 0; i < postcodes.length; i += 1) {
          assert.equal(response.body.result[i].query, postcodes[i]);
        }
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
            response.body.result.forEach((lookup: any) => {
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
            const hasNull = response.body.result.some(
              (l: any) => l.result === null
            );
            assert.isTrue(hasNull);
            done();
          });
      });

      it("returns 400 if too many postcodes submitted", (done) => {
        // @ts-ignore
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
          .end((error) => {
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
