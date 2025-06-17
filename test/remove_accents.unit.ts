import { assert } from "chai";
import { unaccent } from "../api/app/lib/unaccent";
import * as fs from "fs";
import * as path from "path";

const testDataPath = path.resolve(__dirname, "./seed/accent_tests.json");
const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));

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
