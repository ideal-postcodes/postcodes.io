"use strict";

const { assert } = require("chai");
const { unaccent } = require("../src/app/lib/unaccent");
const testData = require("./seed/accent_tests.json");

describe("unaccent", () => {
  it("removes diacritics the same way as postgres", () => {
    // making sure all lines are read
    Object.keys(testData).forEach((accentedString) => {
      const expectedUnaccentedString = testData[accentedString];
      assert.equal(unaccent(accentedString), expectedUnaccentedString);
    });
  });

  it("removes repeated accents", () => {
    assert.equal(unaccent("ÀÀ"), "AA");
  });
});
