"use strict";

const path = require("path");
const { assert } = require("chai");
const { extract, toJson, isPseudoCode } = require("../data/scripts/index");

describe("ONS Code Extraction", () => {
  it("returns an error if no data directory provided", (done) => {
    extract({
      configs: [],
      done: (error, result) => {
        assert.match(error.message, /please specify a data path/i);
        done();
      },
    });
  });

  describe("with valid data directory", () => {
    let argv;

    before(() => {
      // Overwrite argv to point to correct data directory
      argv = process.argv;
      process.argv = process.argv.slice();
      process.argv.push("-d");
      process.argv.push(path.join(__dirname, "./seed/ons_codes"));
    });

    after(() => {
      // Restore argv
      process.argv = argv;
    });

    describe("extract", () => {
      it("returns error if invalid file present", (done) => {
        extract({
          configs: [
            {
              file: "foo",
            },
            {
              file: "bar",
            },
          ],
          done: (error, result) => {
            assert.match(error.message, /files cannot be resolved/i);
            done();
          },
        });
      });

      it("extracts data for given files", (done) => {
        const transform = (row) => {
          const keyIndex = 0;
          const valueIndex = 3;
          if (row[keyIndex] === "CTRY12CD") return []; // Escape if header
          return [row[keyIndex], row[valueIndex]];
        };

        extract({
          configs: [
            {
              transform,
              file: "countries.txt",
              parseOptions: {
                relax_column_count: true,
              },
            },
          ],
          done: (error, result) => {
            assert.isNull(error);
            assert.equal(result.size, 6);
            assert.equal(result.get("E92000001"), "England");
            done();
          },
        });
      });

      it("addends appendMissing to data file", (done) => {
        const transform = (row) => {
          const keyIndex = 0;
          const valueIndex = 3;
          if (row[keyIndex] === "CTRY12CD") return []; // Escape if header
          return [row[keyIndex], row[valueIndex]];
        };

        const appendMissing = {
          foo: "bar",
          baz: {
            qux: "quux",
          },
        };

        extract({
          appendMissing,
          configs: [
            {
              transform,
              file: "countries.txt",
              parseOptions: {
                relax_column_count: true,
              },
            },
          ],
          done: (error, result) => {
            assert.isNull(error);
            assert.equal(result.size, 8);
            assert.equal(result.get("foo"), "bar");
            assert.deepEqual(result.get("baz"), { qux: "quux" });
            done();
          },
        });
      });
    });

    describe("isPseudoCode", () => {
      it("returns true if pseudocode", () => {
        [
          "W99999999",
          "S99999999",
          "N99999999",
          "L99999999",
          "M99999999",
        ].forEach((code) => assert.isTrue(isPseudoCode(code)));
      });
      it("returns false if not pseudocode", () => {
        ["E12000001", "E12000002"].forEach((code) =>
          assert.isFalse(isPseudoCode(code))
        );
      });
    });

    describe("toJson", () => {
      let data;

      beforeEach(() => {
        data = new Map();
        for (let i = 0; i < 100; i++) {
          data.set(`key${i}`, "foo");
        }
      });

      it("converts a map to an JSON object ordered by keys", () => {
        const result = JSON.parse(toJson(data));
        const keys = Object.keys(result);
        assert.equal(keys.length, data.size);
        data.forEach((value, key) => assert.equal(result[key], value));
        keys.reduce((acc, key) => {
          if (acc === null) return key;
          assert.isTrue(key > acc);
          return acc;
        }, null);
      });
    });
  });
});
