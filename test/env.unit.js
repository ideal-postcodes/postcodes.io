"use strict";

const { assert } = require("chai");
const { parseEnv } = require("../src/app/lib/env");

describe("parseEnv", () => {
  it("returns default if variable is undefined", () => {
    const defaultValue = "foo";
    assert.equal(parseEnv(undefined, defaultValue), defaultValue);
  });

  it("returns true if variable is `true`", () => {
    assert.equal(parseEnv("true"), true);
  });

  it("returns false if variable is `false`", () => {
    assert.equal(parseEnv("false"), false);
  });

  it("returns number if varaible is `number`", () => {
    assert.equal(parseEnv("8"), 8);
  });
  it("returns string if variable is `string`", () => {
    assert.equal(parseEnv("FOO"), "FOO");
  });

  it("returns null if variable is 'null'", () => {
    assert.equal(parseEnv("null"), null);
  });

  it("returns empty string if variable is ''", () => {
    assert.equal(parseEnv(""), "");
  });
});
