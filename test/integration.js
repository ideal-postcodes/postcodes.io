"use strict";

const { postcodesioApplication, configFactory } = require("./helper");
const request = require("supertest");
const { assert } = require("chai");
const app = postcodesioApplication();

describe("Pages routes", () => {
  describe("/", async () => {
    it("should return 200", async () => {
      await request(app).get("/").expect(200).expect("Content-Type", /html/);
    });
  });

  describe("/docs", () => {
    it("should return 200", async () => {
      await request(app)
        .get("/docs")
        .expect("Content-Type", /html/)
        .expect(200);
    });
  });

  describe("/about", () => {
    it("should return 200", async () => {
      await request(app)
        .get("/about")
        .expect("Content-Type", /html/)
        .expect(200);
    });
  });

  describe("/explore", () => {
    it("should return 200", async () => {
      await request(app)
        .get("/explore")
        .expect("Content-Type", /html/)
        .expect(200);
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

describe("Misc", () => {
  it("should return a favicon", async () => {
    await request(app).get("/favicon.ico").expect(200);
  });
});

describe("Utils", () => {
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

describe("Serve static assets", () => {
  it("serves public/ when enabled", async () => {
    const config = configFactory();
    config.serveStaticAssets = true;
    const newApp = postcodesioApplication(config);
    await request(newApp).get("/js/app.js").expect(200);
  });
  it("does not serve public/ when disabled", async () => {
    const config = configFactory();
    config.serveStaticAssets = false;
    const newApp = postcodesioApplication(config);
    const response = await request(newApp).get("/js/app.ts").expect(404);
  });
});

describe("httpHeaders", () => {
  it("sets arbitrary headers on all HTTP responses", async () => {
    const config = configFactory();
    config.httpHeaders = { foo: "bar" };
    const newApp = postcodesioApplication(config);
    const response = await request(newApp)
      .get("/ping")
      .expect("foo", "bar")
      .expect(200);
  });
});
