"use strict";

const { assert } = require("chai");
const helper = require("./helper/index");
const { isEmpty } = helper.string;

describe("isEmpty", () => {
  it("returns true if null", () => {
    assert.isTrue(isEmpty(null));
  });
  it("returns true if undefined", () => {
    assert.isTrue(isEmpty(undefined));
  });
  it("returns true if spaces", () => {
    assert.isTrue(isEmpty("   "));
  });
  it("returns true if empty string", () => {
    assert.isTrue(isEmpty(""));
  });
  it("returns true if space", () => {
    assert.isTrue(isEmpty(" "));
  });
  it("returns false if not empty string", () => {
    assert.isFalse(isEmpty("foo"));
  });
});
