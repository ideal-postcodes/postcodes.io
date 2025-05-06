import { assert } from "chai";
import request from "supertest";
import { postcodesioApplication, configFactory } from "./helper";
const app = postcodesioApplication();

describe("Pages routes", () => {
  describe("/", async () => {
    it("should return 200", async () => {
      await request(app).get("/").expect(200).expect("Content-Type", /html/);
    });
  });

  describe("/docs", () => {
    it("should return 301", async () => {
      await request(app)
        .get("/docs")
        .expect("Content-Type", /html/)
        .expect(301);
    });
  });
});

describe("Errors", () => {
  describe("404", () => {
    it("should return a 404 if page does not exist", async () => {
      await request(app)
        .get("/surely/this/pagewouldn/ot/exist")
        .expect("Content-Type", /json/)
        .expect(404);
    });
  });
});


describe("Utils", () => {
  describe("Health", () => {
    it("should return 200 if DB available", async () => {
      const { body } = await request(app)
        .get("/ready")
        .expect(200)
        .expect("Content-Type", /json/);
      assert.equal(body.result, "Ready");
    });
  });
  describe("Ping", () => {
    it("should pong", async () => {
      const { body } = await request(app)
        .get("/ping")
        .expect(200)
        .expect("Content-Type", /json/);
      assert.equal(body.result, "pong");
    });
  });
});

describe("httpHeaders", () => {
  it("sets arbitrary headers on all HTTP responses", async () => {
    const config = configFactory();
    config.httpHeaders = { foo: "bar" };
    const newApp = postcodesioApplication(config);
    await request(newApp).get("/ping").expect("foo", "bar").expect(200);
  });
});
