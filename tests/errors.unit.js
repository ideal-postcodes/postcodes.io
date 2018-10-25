"use strict";

const { assert } = require("chai");
const helper = require("./helper/index.js");
const {
  PostcodesioHttpError,
} = helper.errors;

describe("Errors", () => {
  describe("PostcodesioHttpError", () => {
    it ("instantiates with default attributes", () => {
      const e = new PostcodesioHttpError();
      assert.equal(e.name, "PostcodesioHttpError");
      assert.equal(e.status, 500);
      assert.match(e.humanMessage, /500\sServer\sError/);
      assert.match(e.message, /500\sServer\sError/);
    });
    it ("instantiates with correct attributes", () => {
      const code = 401;
      const msg = "Foo";
      const e = new PostcodesioHttpError(code, msg);
      assert.equal(e.status, code);
      assert.equal(e.humanMessage, msg);
    });
    it ("has toJSON method", () => {
      const e = new PostcodesioHttpError();
      const result = e.toJSON();
      assert.equal(result.status, e.status);
      assert.equal(result.error, e.humanMessage);
    });
  });
});
