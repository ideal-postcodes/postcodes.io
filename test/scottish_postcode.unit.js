"use strict";

const { readFileSync } = require("fs");
const { series } = require("async");
const { assert } = require("chai");
const parse = require("csv-parse/lib/sync");
const {
  ScottishPostcode,
  ScottishConstituency,
  clearScottishPostcodeDb,
  inferSchemaData,
  clearPostcodeDb,
  seedPostcodeDb,
} = require(`./helper`);
const seedFilePath = `${__dirname}/seed/`;
const { query } = require("../src/app/models/base");

describe("Scottish Postcode Model", () => {
  const testPostcodeLarge = "ML11 0GH";
  const testPostcodeSmall = "G82 1JW";

  before(async function () {
    this.timeout(0);
    await clearPostcodeDb();
    await seedPostcodeDb();
  });

  after(async () => clearPostcodeDb());

  describe("#setupTable", () => {
    before(async function () {
      this.timeout(0);
      await ScottishPostcode.destroyRelation();
      await ScottishPostcode.setupTable(seedFilePath);
    });

    after(async function () {
      this.timeout(0);
      await ScottishPostcode.destroyRelation();
      await ScottishPostcode.setupTable(seedFilePath);
    });

    describe("#_createRelation", () => {
      it(`creates a relation that matches ${ScottishPostcode.relation.relation} schema`, async () => {
        const q = `
          SELECT 
            column_name, data_type, character_maximum_length, collation_name
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE table_name = '${ScottishPostcode.relation.relation}'
        `;
        const result = await query(q);
        const impliedSchema = {};
        result.rows.forEach((columnInfo) => {
          let columnName, dataType;
          [columnName, dataType] = inferSchemaData(columnInfo);
          impliedSchema[columnName] = dataType;
        });
        assert.deepEqual(impliedSchema, ScottishPostcode.relation.schema);
      });
    });

    describe("#seedData", () => {
      it("loads correct data from data directory", async () => {
        const q = `SELECT count(*) FROM ${ScottishPostcode.relation.relation}`;
        const result = await query(q);
        assert.isTrue(result.rows[0].count > 0);
      });
    });
  });

  describe("#toJson", () => {
    it("formats a postcode object", () => {
      const postcode = {
        scottish_constituency_id: "foo",
        scottish_parliamentary_constituency: "bar",
        id: "id",
        pc_compact: "pc_compact",
        postcode: "postcode",
      };
      const formatted = ScottishPostcode.toJson(
        JSON.parse(JSON.stringify(postcode))
      );
      assert.deepEqual(formatted, {
        postcode: "postcode",
        scottish_parliamentary_constituency: "bar",
        codes: {
          scottish_parliamentary_constituency: "foo",
        },
      });
    });
  });

  describe("#find", () => {
    it("should return postcode with the right attributes for large user", async () => {
      const result = await ScottishPostcode.find(testPostcodeLarge);
      assert.deepEqual(result, {
        id: result.id,
        pc_compact: "ML110GH",
        postcode: "ML11 0GH",
        scottish_constituency_id: "S16000090",
        scottish_parliamentary_constituency: "Clydesdale",
      });
    });

    it("should return postcode with the right attributes for small users", async () => {
      const result = await ScottishPostcode.find(testPostcodeSmall);
      assert.deepEqual(result, {
        id: result.id,
        pc_compact: "G821JW",
        postcode: "G82 1JW",
        scottish_constituency_id: "S16000096",
        scottish_parliamentary_constituency: "Dumbarton",
      });
    });

    it("should return null for null/undefined postcode search", async () => {
      const result = await ScottishPostcode.find(null);
      assert.isNull(result);
    });

    it("returns null if invalid postcode", async () => {
      const result = await ScottishPostcode.find("1");
      assert.isNull(result);
    });

    it("should be insensitive to space", async () => {
      const result = await ScottishPostcode.find(
        testPostcodeLarge.replace(/\s/, "")
      );
      assert.equal(result.postcode, testPostcodeLarge);
    });

    it("should return null if postcode does not exist", async () => {
      const result = await ScottishPostcode.find("ID11QD");
      assert.isNull(result);
    });
  });
});
