import request from "supertest";
import { assert } from "chai";
import * as helper from "./helper";
import { Done } from "mocha";
const app = helper.postcodesioApplication();

describe("Outcodes routes", () => {
  let testOutcode: string, uri: string;

  before(async function () {
    this.timeout(0);
    await helper.clearPostcodeDb();
    await helper.seedPostcodeDb();
  });

  beforeEach(() => {
    testOutcode = "AB10";
    uri = `/outcodes/${encodeURI(testOutcode)}/nearest`;
  });

  after(async () => helper.clearPostcodeDb);

  describe("GET /outcodes/:outcode/nearest", () => {
    it("should return a list of nearby outcodes", (done: Done) => {
      request(app)
        .get(uri)
        .expect("Content-Type", /json/)
        .expect(helper.allowsCORS)
        .expect(200)
        .end((error: Error, response: any) => {
          if (error) return done(error);
          assert.isArray(response.body.result);
          assert.isTrue(response.body.result.length > 0);
          response.body.result.forEach((o: any) => helper.isOutcodeObject(o));
          done();
        });
    });
    it("should be sensitive to distance query", (done: Done) => {
      request(app)
        .get(uri)
        .expect(200)
        .end((error: Error, firstResponse: any) => {
          if (error) return done(error);
          request(app)
            .get(uri)
            .query({
              radius: 25000,
            })
            .expect(200)
            .end((error: Error, secondResponse: any) => {
              if (error) return done(error);
              assert.isTrue(
                secondResponse.body.result.length >=
                  firstResponse.body.result.length
              );
              done();
            });
        });
    });

    it("should be sensitive to limit query", (done: Done) => {
      request(app)
        .get(uri)
        .query({
          limit: 1,
        })
        .expect(200)
        .end((error: Error, response: any) => {
          if (error) return done(error);
          assert.equal(response.body.result.length, 1);
          done();
        });
    });

    it("should throw a 400 error if invalid limit", (done: Done) => {
      request(app)
        .get(uri)
        .query({
          limit: "bogus",
        })
        .expect(400)
        .end((error: Error, response: any) => {
          if (error) return done(error);
          assert.equal(response.body.error, "Invalid result limit submitted");
          done();
        });
    });

    it("should throw a 400 error if invalid distance", (done: Done) => {
      request(app)
        .get(uri)
        .query({
          radius: "bogus",
        })
        .expect(400)
        .end((error: Error, response: any) => {
          if (error) return done(error);
          assert.equal(response.body.error, "Invalid lookup radius submitted");
          done();
        });
    });

    it("should respond to options", (done: Done) => {
      request(app)
        .options(uri)
        .expect(204)
        .end((error: Error, response: any) => {
          if (error) done(error);
          helper.validCorsOptions(response);
          done();
        });
    });

    it("should return 404 if outcode not found", (done: Done) => {
      const testOutcode = "ZZ10";
      const path = ["/outcodes/", encodeURI(testOutcode), "/nearest"].join("");
      request(app)
        .get(path)
        .expect("Content-Type", /json/)
        .expect(404)
        .end((error: Error, response: any) => {
          if (error) return done(error);
          assert.equal(response.body.error, "Outcode not found");
          done();
        });
    });
  });
});
