"use strict";

const request = require("supertest");
const { assert } = require("chai");
const { postcodesioApplication } = require("./helper");
const app = postcodesioApplication();

describe("Preflight Requests (OPTIONS)", () => {
  it("should allows preflight requests", async () => {
    const response = await request(app)
      .options("/")
      .expect(204);
    assert.equal(response.headers["access-control-allow-origin"], "*");
    assert.equal(
      response.headers["access-control-allow-methods"],
      "GET,POST,OPTIONS"
    );
  });
});
