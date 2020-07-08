"use strict";

const Pc = require("postcode");
const path = require("path");
const async = require("async");
const assert = require("chai").assert;
const helper = require(`${__dirname}/helper`);

const Postcode = helper.Postcode;

describe("Postcode Model", function () {
  let testPostcode, testOutcode;

  before(async function () {
    this.timeout(0);
    await helper.clearPostcodeDb();
    await helper.seedPostcodeDb();
  });

  beforeEach(async () => {
    const result = await helper.lookupRandomPostcode();
    testPostcode = result.postcode;
    testOutcode = result.outcode;
  });

  after(async () => helper.clearPostcodeDb);

  describe("#search", () => {
    it("returns single result if exact match", async () => {
      const result = await Postcode.search({ postcode: testPostcode });
      assert.equal(result.length, 1);
      assert.equal(result[0].postcode, testPostcode);
    });

    it("should return a list of candidate postcodes for given search term", async () => {
      testPostcode = testPostcode.slice(0, 2);
      const result = await Postcode.search({ postcode: testPostcode });
      assert.notEqual(result.length, 0);
      result.forEach((p) => helper.isRawPostcodeObjectWithFC(p));
    });
    it("should be case insensitive", async () => {
      testPostcode = testPostcode.slice(0, 2).toLowerCase();
      const result = await Postcode.search({ postcode: testPostcode });
      assert.notEqual(result.length, 0);
      result.forEach((p) => helper.isRawPostcodeObjectWithFC(p));
    });
    it("should work regardless of spaces", async () => {
      testPostcode = testPostcode.slice(0, 4).replace(" ", "");
      const result = await Postcode.search({ postcode: testPostcode });
      assert.notEqual(result.length, 0);
      result.forEach((p) => helper.isRawPostcodeObjectWithFC(p));
    });
    it("filters out unreasonable results", async () => {
      // i.e. "A0" should not produces matches beginning "A1"
      testPostcode = "A0";
      const result = await Postcode.search({ postcode: testPostcode });
      assert.isNull(result);
    });

    describe("ordering", () => {
      it("returns M1 < M11 for 'M1'", async () => {
        const postcode = "M1";
        const result = await Postcode.search({ postcode: postcode });
        assert.equal(result.length, 2);
        assert.equal(result[0].postcode, "M1 1AD");
        assert.equal(result[1].postcode, "M11 1AA");
      });
      it("returns M1 < M11 for 'M1 '", async () => {
        const postcode = "M1 ";
        const result = await Postcode.search({ postcode: postcode });
        assert.equal(result.length, 2);
        assert.equal(result[0].postcode, "M1 1AD");
        assert.equal(result[1].postcode, "M11 1AA");
      });
      it("returns M1 < M11 for 'M1 1'", async () => {
        const postcode = "M1 1";
        const result = await Postcode.search({ postcode: postcode });
        assert.equal(result.length, 2);
        assert.equal(result[0].postcode, "M1 1AD");
        assert.equal(result[1].postcode, "M11 1AA");
      });
      it("returns M11 for 'M11'", async () => {
        const postcode = "M11";
        const result = await Postcode.search({ postcode: postcode });
        assert.equal(result.length, 1);
        assert.equal(result[0].postcode, "M11 1AA");
      });
      it("returns M11 for 'M11 '", async () => {
        const postcode = "M11 ";
        const result = await Postcode.search({ postcode: postcode });
        assert.equal(result.length, 1);
        assert.equal(result[0].postcode, "M11 1AA");
      });
      it("returns SE1 < SE1P for 'SE1'", async () => {
        const postcode = "SE1";
        const result = await Postcode.search({ postcode: postcode });
        assert.equal(result.length, 2);
        assert.equal(result[0].postcode, "SE1 9ZZ");
        assert.equal(result[1].postcode, "SE1P 5ZZ");
      });
      it("returns SE1 for 'SE1 '", async () => {
        const postcode = "SE1 ";
        const result = await Postcode.search({ postcode: postcode });
        assert.equal(result.length, 2);
        assert.equal(result[0].postcode, "SE1 9ZZ");
        assert.equal(result[1].postcode, "SE1P 5ZZ");
      });
      it("returns SE1 for 'SE1 9'", async () => {
        const postcode = "SE1 9";
        const result = await Postcode.search({ postcode: postcode });
        assert.equal(result.length, 1);
        assert.equal(result[0].postcode, "SE1 9ZZ");
      });
      it("returns SE1P for 'SE1P'", async () => {
        const postcode = "SE1P";
        const result = await Postcode.search({ postcode: postcode });
        assert.equal(result.length, 1);
        assert.equal(result[0].postcode, "SE1P 5ZZ");
      });
      it("returns SE1P for 'SE1P '", async () => {
        const postcode = "SE1P ";
        const result = await Postcode.search({ postcode: postcode });
        assert.equal(result.length, 1);
        assert.equal(result[0].postcode, "SE1P 5ZZ");
      });
    });

    describe("sensible outcode matching", () => {
      it("returns strict outcode matches first", async () => {
        testOutcode = "AB1";
        const result = await Postcode.search({ postcode: testOutcode });
        assert.equal(result[0].outcode, testOutcode);
        result.forEach((pc) => assert.include(pc.outcode, testOutcode));
      });
      it("returns no matches if invalid outcode", async () => {
        testOutcode = "AA1";
        const result = await Postcode.search({ postcode: testOutcode });
        assert.isNull(result);
      });
    });

    describe("when space delineated", () => {
      it("is sensitive to space in postcode search", async () => {
        testOutcode = "AB1 9";
        const result = await Postcode.search({ postcode: testOutcode });
        assert.equal(result[0].outcode, "AB1");
      });
      it("returns next closest postcodes if invalid outcode", async () => {
        testOutcode = "AA1 9";
        const result = await Postcode.search({ postcode: testOutcode });
        assert.isNull(result);
      });
    });

    describe("deterministic ordering", () => {
      it("ASCIIbetially sorts queries", async () => {
        testPostcode = testPostcode.slice(0, 2);
        const result = await Postcode.search({ postcode: testPostcode });
        result.reduce((acc, postcode) => {
          if (acc) assert.isTrue(postcode.postcode > acc.postcode);
          return postcode;
        }, null);
      });
    });
    describe("limit", () => {
      it("is sensitive to limit", async () => {
        const query = "A";
        const results = await Promise.all(
          [2, 3].map(async (limit) => {
            const result = await Postcode.search({
              postcode: query,
              limit: limit,
            });
            assert.equal(result.length, limit);
            return result;
          })
        );
        results.forEach((result) => {
          result.forEach((p) => helper.isRawPostcodeObjectWithFC(p));
        });
      });
      it("returns a default maximum number of results", async () => {
        const query = "A";
        const result = await Postcode.search({ postcode: query, limit: 1000 });
        assert.equal(result.length, helper.config.defaults.search.limit.MAX);
        result.forEach((p) => helper.isRawPostcodeObjectWithFC(p));
      });
      it("returns 10 postcodes by default", async () => {
        const query = "A";
        const result = await Postcode.search({ postcode: query });
        assert.equal(
          result.length,
          helper.config.defaults.search.limit.DEFAULT
        );
        result.forEach((p) => helper.isRawPostcodeObjectWithFC(p));
      });
      it("uses default limit if limit < 1", async () => {
        const query = "A";
        const result = await Postcode.search({ postcode: query, limit: 0 });
        assert.equal(
          result.length,
          helper.config.defaults.search.limit.DEFAULT
        );
        result.forEach((p) => helper.isRawPostcodeObjectWithFC(p));
      });
      it("uses default limit if invalid limit supplied", async () => {
        const query = "A";
        const result = await Postcode.search({
          postcode: query,
          limit: "limit",
        });
        assert.equal(
          result.length,
          helper.config.defaults.search.limit.DEFAULT
        );
        result.forEach((p) => helper.isRawPostcodeObjectWithFC(p));
      });
    });
  });
});
