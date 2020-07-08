"use strict";

const async = require("async");
const assert = require("chai").assert;
const helper = require("./helper/index");
const { query } = require("../src/app/models/base");

const TerminatedPostcode = helper.TerminatedPostcode;

const resetTerminatedPostcodeRelation = async () => {
  await helper.clearTerminatedPostcodesDb();
  await helper.seedTerminatedPostcodeDb();
};

describe("Terminated postcode model", () => {
  let testTerminatedPostcode;
  before(async function () {
    this.timeout(0);
    await resetTerminatedPostcodeRelation();
  });

  beforeEach(async () => {
    const result = await helper.randomTerminatedPostcode();
    testTerminatedPostcode = result.postcode;
  });

  after(async () => helper.clearTerminatedPostcodesDb());

  describe("#find", () => {
    it("should return a terminated postcode with right attributes", async () => {
      const result = await TerminatedPostcode.find(testTerminatedPostcode);
      assert.equal(result.postcode, testTerminatedPostcode);
      helper.isRawTerminatedPostcodeObject(result);
    });
    it("should return null for null/undefined terminated postcode search", async () => {
      const result = await TerminatedPostcode.find(null);
      assert.isNull(result);
    });
    it("returns null if invalid postcode", async () => {
      const result = await TerminatedPostcode.find("1");
      assert.isNull(result);
    });
    it("should be insensitive to space", async () => {
      const result = await TerminatedPostcode.find(
        testTerminatedPostcode.replace(/\s/, "")
      );
      assert.equal(result.postcode, testTerminatedPostcode);
    });
    it("should return null if postcode does not exist", async () => {
      const result = await TerminatedPostcode.find("ID11QD");
      assert.isNull(result);
    });
  });

  describe("#toJson", () => {
    it("return an object with whitelisted attributes only", async () => {
      const result = await TerminatedPostcode.find(testTerminatedPostcode);
      helper.isTerminatedPostcodeObject(TerminatedPostcode.toJson(result));
    });
  });

  const assertRelationIsPopulated = async () => {
    const q = `SELECT count(*) FROM ${TerminatedPostcode.relation.relation}`;
    const result = await query(q);
    assert.isTrue(result.rows[0].count > 0);
  };

  describe("#seedPostcodes", () => {
    before(async function () {
      this.timeout(0);
      await TerminatedPostcode.clear();
      await TerminatedPostcode.seedPostcodes(helper.seedPostcodePath);
    });

    after(async function () {
      this.timeout(0);
      await resetTerminatedPostcodeRelation();
    });

    it("seeds terminated postcode table", assertRelationIsPopulated);
  });

  describe("#setupTable", () => {
    before(async function () {
      this.timeout(0);
      await helper.clearTerminatedPostcodesDb();
      await TerminatedPostcode.setupTable(helper.seedPostcodePath);
    });

    after(async function () {
      this.timeout(0);
      await resetTerminatedPostcodeRelation();
    });

    it("creates relation", async () => {
      const result = await helper.listDatabaseRelations();
      const relationName = TerminatedPostcode.relation.relation;
      const test = (r) => r.Name === relationName && r.Type === "table";
      assert.isTrue(result.rows.some(test));
    });
    it("populates relation", assertRelationIsPopulated);
    it("creates indexes", async () => {
      const result = await helper.listDatabaseIndexes();
      assert.isTrue(
        result.rows.filter(
          (i) => i.indrelid === TerminatedPostcode.relation.relation
        ).length > 0
      );
    });
  });
});
