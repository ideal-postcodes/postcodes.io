import path from "path";
import { assert } from "chai";
import { extract, toJson, isPseudoCode } from "../data/scripts/index";
import { Done } from "mocha";

describe("ONS Code Extraction", () => {
  it("returns an error if no data directory provided", (done: Done) => {
    extract({
      configs: [],
      done: (error: Error) => {
        assert.match(error.message, /please specify a data path/i);
        done();
      },
    });
  });

  describe("with valid data directory", () => {
    let argv: any;

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
      it("returns error if invalid file present", (done: Done) => {
        extract({
          configs: [
            {
              file: "foo",
            },
            {
              file: "bar",
            },
          ],
          done: (error: Error) => {
            assert.match(error.message, /files cannot be resolved/i);
            done();
          },
        });
      });

      it("extracts data for given files", (done: Done) => {
        const transform = (row: any) => {
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
          done: (error: Error, result: any) => {
            assert.isNull(error);
            assert.equal(result.size, 6);
            assert.equal(result.get("E92000001"), "England");
            done();
          },
        });
      });

      it("addends appendMissing to data file", (done: Done) => {
        const transform = (row: any) => {
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
          done: (error: Error, result: any) => {
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
        ].forEach((code: string) => assert.isTrue(isPseudoCode(code)));
      });
      it("returns false if not pseudocode", () => {
        ["E12000001", "E12000002"].forEach((code: string) =>
          assert.isFalse(isPseudoCode(code))
        );
      });
    });

    describe("toJson", () => {
      let data: any;

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
        data.forEach((value: any, key: string) =>
          assert.equal(result[key], value)
        );
        keys.reduce((acc, key) => {
          if (acc === null) return key;
          assert.isTrue(key > acc);
          return acc;
        }, null);
      });
    });
  });
});
