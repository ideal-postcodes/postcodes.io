"use strict";

import request from "supertest";
import { assert } from "chai";
import { postcodesioApplication } from "./helper";
const app = postcodesioApplication();

describe("Preflight Requests (OPTIONS)", () => {
  it("should allows preflight requests", async () => {
    const response = await request(app).options("/").expect(204);
    assert.equal(response.headers["access-control-allow-origin"], "*");
    assert.equal(
      response.headers["access-control-allow-methods"],
      "GET,POST,OPTIONS"
    );
  });
});
