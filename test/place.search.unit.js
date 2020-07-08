"use strict";

const fs = require("fs");
const async = require("async");
const { assert } = require("chai");
const parse = require("csv-parse/lib/sync");
const helper = require("./helper/index");
const { defaults } = require("../src/config/config")();
const searchDefaults = defaults.placesSearch;
const { Place } = helper;

describe("Place Model", () => {
  let testPostcode, testOutcode;

  before(async function () {
    this.timeout(0);
    await helper.clearPostcodeDb();
    await helper.seedPostcodeDb();
  });

  after(async () => helper.clearPostcodeDb);

  const searchMethods = [
    {
      name: "Prefix Search",
      fn: Place.prefixSearch,
    },
    {
      name: "Terms Search",
      fn: Place.termsSearch,
    },
  ];

  const testQueries = ["taobh a chaolais", "llwyn y groes", "corston"];

  searchMethods.forEach((method) => {
    const fn = method.fn;
    describe(`${method.name}`, () => {
      testQueries.forEach((testQuery) => {
        it(`finds exact matches on query: ${testQuery}`, async () => {
          const results = await fn({ name: testQuery });
          assert.equal(results.length, 1);
          results.forEach(helper.isRawPlaceObject);
          assert.equal(results[0].name_1_search, testQuery);
        });
      });
    });
  });

  describe("_prefixSearch", () => {
    const testQueries = ["be", "s", "br"];
    testQueries.forEach((query) => {
      it(`finds incomplete words. like '${query}'`, async () => {
        const results = await Place.prefixSearch({ name: query });
        assert(results.length > 0);
        results.forEach(helper.isRawPlaceObject);
        results.forEach((result) => {
          assert(result.name_1_search.startsWith(query));
        });
      });
    });
  });

  describe("_termsSearch", () => {
    it("matches prepositions like 'of'", async () => {
      const results = await Place.termsSearch({ name: "of" });
      assert(results.length > 0);
      results.forEach(helper.isRawPlaceObject);
      results.forEach((result) => {
        assert(result.name_1_search.includes("of"));
      });
    });
  });

  describe("#search", () => {
    it("returns a list of places for given search term", async () => {
      const results = await Place.search({ name: "b" });
      results.forEach(helper.isRawPlaceObject);
    });
    it("returns null if no query", async () => {
      const results = await Place.search({});
      assert.isNull(results);
    });
    it("is sensitive to limit", async () => {
      const results = await Place.search({
        name: "b",
        limit: 1,
      });
      assert.equal(results.length, 1);
      results.forEach(helper.isRawPlaceObject);
    });
    it("returns up to 10 results by default", async () => {
      const results = await Place.search({ name: "b" });
      assert.equal(results.length, 10);
      results.forEach(helper.isRawPlaceObject);
    });
    it("sets limit to default maximum if it's greater than it", async () => {
      const searchDefaultMax = searchDefaults.limit.MAX;
      searchDefaults.limit.MAX = 5;
      const results = await Place.search({
        name: "b",
        limit: 1000,
      });
      assert.equal(results.length, 5);
      results.forEach(helper.isRawPlaceObject);
      searchDefaults.limit.MAX = searchDefaultMax;
    });
    it("uses default limit if invalid limit supplied", async () => {
      const results = await Place.search({
        name: "b",
        limit: -1,
      });
      assert.equal(results.length, 10);
      results.forEach(helper.isRawPlaceObject);
    });
    it("searches with name_2", async () => {
      const name = "East Kilbride";
      const results = await Place.search({ name: name });
      assert.equal(results.length, 1);
      results.forEach(helper.isRawPlaceObject);
      assert.equal(results[0].name_2, name);
    });
    describe("result specs", () => {
      it("returns names with apostrophes", async () => {
        const name = "Taobh a' Chaolais";
        const results = await Place.search({
          name: name.replace(/'/g, ""),
        });
        assert.equal(results.length, 1);
        results.forEach(helper.isRawPlaceObject);
        assert.equal(results[0].name_1, name);
      });
      it("returns names with non-ascii characters", async () => {
        const name = "Mynydd-llêch";
        const results = await Place.search({
          name: name.replace("ê", "e"),
        });
        assert.equal(results.length, 1);
        results.forEach(helper.isRawPlaceObject);
        assert.equal(results[0].name_1, name);
      });
      it("returns names with hyphens", async () => {
        const name = "Llwyn-y-groes";
        const results = await Place.search({
          name: name.replace(/-/g, " "),
        });
        assert.equal(results.length, 1);
        results.forEach(helper.isRawPlaceObject);
        assert.equal(results[0].name_1, name);
      });
      it("successfully matches where query is middle word", async () => {
        const query = "of";
        const results = await Place.search({
          name: query,
        });
        assert(results.length > 0);
        results.forEach(helper.isRawPlaceObject);
        results.forEach((result) => {
          assert(result.name_1_search.includes(query));
        });
      });
      it("returns null if both prefix and terms search fail", async () => {
        const query = "this is never gonna get matched";
        const results = await Place.search({
          name: query,
        });
        assert.isNull(results);
      });
    });
    describe("query specs", () => {
      it("is case insensitive", async () => {
        const name = "Corston";
        const results = await Place.search({
          name: name.toUpperCase(),
        });
        assert.equal(results.length, 1);
        results.forEach(helper.isRawPlaceObject);
        assert.equal(results[0].name_1, name);
      });
      it("handles apostrophes", async () => {
        const name = "Taobh a' Chaolais";
        const results = await Place.search({
          name: name,
        });
        assert.equal(results.length, 1);
        results.forEach(helper.isRawPlaceObject);
        assert.equal(results[0].name_1, name);
      });
      it("handles non-ascii characters", async () => {
        const name = "Mynydd-llêch";
        const results = await Place.search({ name: name });
        assert.equal(results.length, 1);
        results.forEach(helper.isRawPlaceObject);
        assert.equal(results[0].name_1, name);
      });
      it("handles non-ascii character prefix searches", async () => {
        const prefix = "Mynydd-llêc";
        const name = "Mynydd-llêch";
        const results = await Place.search({ name: prefix });
        assert.equal(results.length, 1);
        results.forEach(helper.isRawPlaceObject);
        assert.equal(results[0].name_1, name);
      });
      it("handles hyphens as spaces", async () => {
        const name = "Llwyn-y-groes";
        const results = await Place.search({ name: name });
        assert.equal(results.length, 1);
        results.forEach(helper.isRawPlaceObject);
        assert.equal(results[0].name_1, name);
      });
    });
  });
});
