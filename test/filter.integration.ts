import { assert, expect } from "chai";
import request from "supertest";
import * as helper from "./helper/index";
import { Done } from "mocha";
const app = helper.postcodesioApplication();

describe("Filter method", function () {
  let testPostcode: string;

  before(async function () {
    this.timeout(0);
    await helper.clearPostcodeDb();
    await helper.seedPostcodeDb();
  });

  beforeEach(async () => {
    const result = await helper.lookupRandomPostcode();
    testPostcode = result.postcode;
  });

  after(async () => helper.clearPostcodeDb());

  describe("Bulk postcode lookup", () => {
    it("filters by filter attributes", (done: Done) => {
      const filter = "postcode";
      request(app)
        .post("/postcodes")
        .query({
          filter: filter,
        })
        .send({
          postcodes: [testPostcode],
        })
        .expect(200)
        .end((error: Error, response: any) => {
          if (error) return done(error);
          response.body.result.forEach((resultObj: any) => {
            assert.exists(resultObj.result["postcode"]);
            assert.isTrue(Object.keys(resultObj.result).length === 1);
          });
          done();
        });
    });
    it("filters by attribute array", (done: Done) => {
      const filter = "postcode,country";
      request(app)
        .post("/postcodes")
        .query({
          filter: filter,
        })
        .send({
          postcodes: [testPostcode, testPostcode],
        })
        .expect(200)
        .end((error: Error, response: any) => {
          if (error) return done(error);
          response.body.result.forEach((resultObj: any) => {
            assert.exists(resultObj.result["postcode"]);
            assert.exists(resultObj.result["country"]);
            assert.isTrue(Object.keys(resultObj.result).length === 2);
          });
          done();
        });
    });
    it("returns empty object if no matching filters", (done: Done) => {
      const filter = "definitely,nota,matchingfilter";
      request(app)
        .post("/postcodes")
        .query({
          filter: filter,
        })
        .send({
          postcodes: [testPostcode, testPostcode],
        })
        .expect(200)
        .end((error: Error, response: any) => {
          if (error) return done(error);
          response.body.result.forEach((resultObj: any) => {
            assert.isObject(resultObj.result);
            expect(resultObj.result).to.be.empty;
          });
          done();
        });
    });
    it("returns null on postcode not found", (done: Done) => {
      const filter = "quaLity,postcode,Bar";
      request(app)
        .post("/postcodes")
        .query({
          filter: filter,
        })
        .send({
          postcodes: ["OX49 NU", testPostcode],
        })
        .expect(200)
        .end((error: Error, response: any) => {
          if (error) return done(error);
          assert.isTrue(response.body.result[0].result === null);
          assert.exists(response.body.result[1].result["postcode"]);
          assert.exists(response.body.result[1].result["quality"]);
          assert.isTrue(
            Object.keys(response.body.result[1].result).length === 2
          );
          done();
        });
    });
    it("is case/whitespace insensitive", (done: Done) => {
      const filter = "   quALiTy,    PostcodE,   Bar";
      request(app)
        .post("/postcodes")
        .query({
          filter: filter,
        })
        .send({
          postcodes: [testPostcode, testPostcode],
        })
        .expect(200)
        .end((error: Error, response: any) => {
          if (error) return done(error);
          assert.exists(response.body.result[0].result["postcode"]);
          assert.exists(response.body.result[0].result["quality"]);
          assert.exists(response.body.result[1].result["postcode"]);
          assert.exists(response.body.result[1].result["quality"]);
          assert.isTrue(
            Object.keys(response.body.result[0].result).length === 2
          );
          assert.isTrue(
            Object.keys(response.body.result[1].result).length === 2
          );
          done();
        });
    });
  });

  describe("Bulk geolocation lookup", () => {
    let location: any;

    beforeEach(async () => {
      location = await helper.randomLocation();
    });

    it("filters by a single attribute", (done: Done) => {
      const filter = "country";
      request(app)
        .post("/postcodes")
        .query({
          filter: filter,
        })
        .send({ geolocations: [location, location] })
        .expect(200)
        .end((error: Error, response: any) => {
          if (error) return done(error);
          response.body.result.forEach((obj: any) => {
            obj.result.forEach((obj: any) => {
              assert.isTrue(Object.keys(obj).length === 1);
              assert.exists(obj["country"]);
            });
          });
          done();
        });
    });
    it("filters by multiple attributes", (done: Done) => {
      const filter = "country,northings";
      request(app)
        .post("/postcodes")
        .query({
          filter: filter,
        })
        .send({ geolocations: [location, location] })
        .expect(200)
        .end((error: Error, response: any) => {
          if (error) return done(error);
          response.body.result.forEach((obj: any) => {
            obj.result.forEach((obj: any) => {
              assert.isTrue(Object.keys(obj).length === 2);
              assert.exists(obj["country"]);
              assert.exists(obj["northings"]);
            });
          });
          done();
        });
    });
    it("returns null on postcodes not found and is case/whitespace insensitive", (done: Done) => {
      const filter = "coUntRY, nOrThings   , B22ar";
      request(app)
        .post("/postcodes")
        .query({
          filter: filter,
        })
        .send({ geolocations: [{ longitude: 0, latitude: 0 }, location] })
        .expect(200)
        .end((error: Error, response: any) => {
          if (error) return done(error);
          const result = response.body.result;

          result
            .filter((r: any) => r.query.longitude === 0)
            .forEach((r: any) => assert.isNull(r.result));

          result
            .filter((r: any) => r.query.longitude !== 0)
            .forEach((r: any) => {
              r.result.forEach((obj: any) => {
                assert.isTrue(Object.keys(obj).length === 2);
                assert.exists(obj["country"]);
                assert.exists(obj["northings"]);
              });
            });
          done();
        });
    });
  });
});
