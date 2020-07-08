import * as helper from "./helper";
import { assert } from "chai";
import { query, csvExtractor } from "../src/app/models/base";
import spdSchemaLarge from "../data/spd_large_schema.json";
import spdSchemaSmall from "../data/spd_small_schema.json";
import onspdSchema from "../data/onspd_schema.json";

describe("Base model", function () {
  describe("Base model instance methods", function () {
    describe("#query", function () {
      it("should execute a query", async () => {
        const result = await query("SELECT * FROM pg_tables");
        assert.isArray(result.rows);
      });
    });
  });

  describe("CRUD methods", function () {
    let customRelation: any;

    before(async () => {
      customRelation = helper.getCustomRelation();
      await customRelation.createRelation();
    });

    after(async () => {
      await customRelation.destroyRelation();
    });

    describe("#_create", () => {
      it("should return an error if property no in schema", async () => {
        try {
          await customRelation.create({
            bogus: "bogusfield",
          });
        } catch (error) {
          assert.equal(
            error.message,
            `column "bogus" of relation "${customRelation.relation.relation}" does not exist`
          );
        }
      });
      it("should create a new record", async () => {
        await customRelation.create({
          somefield: "unique",
        });
      });
    });

    describe("#all", () => {
      it("should return list of all records", async () => {
        const result = await customRelation.all();
        const containsUnique = result.rows.some(function (elem: any) {
          return elem.somefield === "unique";
        });
        assert.isTrue(result.rows.length > 0);
        assert.isTrue(containsUnique);
      });
    });
  });

  describe("#_createRelation", function () {
    let customRelation: any;

    before(function () {
      customRelation = helper.getCustomRelation();
    });

    it("should create a table with the right attributes", async () => {
      await customRelation.createRelation();
    });

    after(async () => {
      await customRelation.destroyRelation();
    });
  });

  describe("#_destroyRelation", function () {
    let customRelation: any;

    before(async () => {
      customRelation = helper.getCustomRelation();
      await customRelation.createRelation();
    });

    it("should delete the relation", async () => {
      await customRelation.destroyRelation();
    });
  });

  describe("#csvSeed", function () {
    let customRelation: any;

    before(async () => {
      customRelation = helper.getCustomRelation();
      await customRelation.createRelation();
    });

    after(async () => {
      await customRelation.destroyRelation();
    });

    it("should seed the relation table with data", async () => {
      await customRelation.csvSeed({
        filepath: [helper.seedPaths.customRelation],
        columns: "someField",
      });
      const result = await customRelation.all();
      const hasLorem = result.rows.some(function (elem: any) {
        return elem.somefield === "Lorem";
      });
      assert.isTrue(hasLorem);
    });
  });

  describe("#clear", function () {
    let customRelation: any;

    before(async () => {
      customRelation = helper.getCustomRelation();
      await customRelation.createRelation();
      await customRelation.csvSeed({
        filepath: [helper.seedPaths.customRelation],
        columns: ["someField"],
      });
      const data = await customRelation.all();
      assert.isTrue(data.rows.length > 0);
    });

    after(async () => await customRelation.destroyRelation());

    it("should clear the table", async () => {
      await customRelation.clear();
      const data = await customRelation.all();
      assert.equal(data.rows.length, 0);
    });
  });

  describe("csvExtractor", () => {
    it("generates function that extracts correct ONSPD val from row", () => {
      const row = ["foo", "bar", "baz"];
      const extract = csvExtractor(onspdSchema);
      assert.equal(extract(row, "pcd"), "foo");
      assert.equal(extract(row, "pcd2"), "bar");
      assert.equal(extract(row, "pcds"), "baz");
    });

    it("generates function that extracts correct SPD val from row", () => {
      const row = ["foo", "bar", "baz", "date"];

      const extract = csvExtractor(spdSchemaSmall);
      assert.equal(extract(row, "Postcode"), "foo");
      assert.equal(extract(row, "DateOfIntroduction"), "date");
    });

    it("extracts correct SPD val from row when large specified", () => {
      const row = new Array(15);
      row[14] = "yes";
      const extract = csvExtractor(spdSchemaLarge);
      assert.equal(
        extract(row, "ScottishParliamentaryConstituency2014Code"),
        "yes"
      );
    });
  });
});
