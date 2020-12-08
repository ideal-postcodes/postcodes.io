import * as fs from "fs";
import * as path from "path";
import { assert } from "chai";
import parse from "csv-parse/lib/sync";
import * as helper from "./helper/index";
import { PostcodesioHttpError } from "../src/app/lib/errors";
const seedFilePath = path.resolve(__dirname, "./seed/postcode.csv");
const Postcode = helper.Postcode;
import { query } from "../src/app/models/base";

/**
 * Counts number of postcode records if
 * - not headers
 * - not terminated
 */
const postcodeRecordCount = (seedFilePath: any) => {
  return parse(fs.readFileSync(seedFilePath)).filter(
    (row: any) => row[0] !== "pcd" && row[4].length === 0
  ).length;
};

const postcodeEntriesCount = postcodeRecordCount(seedFilePath);

describe("Postcode Model", function () {
  let testPostcode: string, testOutcode: string;

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

  after(async () => helper.clearPostcodeDb());

  describe("#setupTable", function () {
    before(async function () {
      this.timeout(0);
      await Postcode.destroyRelation();
      await Postcode.setupTable(seedFilePath);
    });

    after(async function () {
      this.timeout(0);
      await Postcode.destroyRelation();
      await Postcode.setupTable(seedFilePath);
    });

    describe("#_createRelation", () => {
      it(`creates a relation that matches ${Postcode.relation.relation} schema`, async () => {
        const q = `
					SELECT 
						column_name, data_type, character_maximum_length, collation_name
					FROM INFORMATION_SCHEMA.COLUMNS 
					WHERE table_name = '${Postcode.relation.relation}'
				`;
        const result = await query(q);
        const impliedSchema: any = {};
        result.rows.forEach((columnInfo) => {
          const [columnName, dataType] = helper.inferSchemaData(columnInfo);
          impliedSchema[columnName] = dataType;
        });
        assert.deepEqual(impliedSchema, Postcode.relation.schema);
      });
    });

    describe("#seedData", () => {
      it("loads correct data from data directory", async () => {
        const q = `SELECT count(*) FROM ${Postcode.relation.relation}`;
        const result = await query(q);
        assert.equal(result.rows[0].count, postcodeEntriesCount);
      });
    });

    describe("#populateLocation", () => {
      it("populates location collumn with geohashes", async () => {
        const q = `SELECT location from ${Postcode.relation.relation} WHERE location IS NOT NULL`;
        const result = await query(q);
        result.rows.forEach((row) => assert.equal(row.location.length, 50));
      });
    });

    describe("#createIndexes", () => {
      it("generates indexes that matches to what's been specified", async () => {
        const q = `
					SELECT indexdef 
					FROM pg_indexes 
					WHERE tablename = '${Postcode.relation.relation}'
				`;
        const result = await query(q);
        const dbIndexes = result.rows
          .map((row) => helper.inferIndexInfo(row.indexdef))
          .filter((r) => r.column !== "id");
        const byIndexColumns = helper.sortByIndexColumns;
        assert.deepEqual(
          dbIndexes.sort(byIndexColumns),
          Postcode.relation.indexes.sort(byIndexColumns)
        );
      });
    });
  });

  describe("#toJson", () => {
    it("formats an address object", () => {
      const address = {
        admin_district_id: "admin_district_id",
        admin_county_id: "admin_county_id",
        admin_ward_id: "admin_ward_id",
        parish_id: "parish_id",
        ccg_id: "ccg_id",
        nuts_code: "nuts_code",
        id: 0,
        location: "location",
        pc_compact: "pc_compact",
      };
      // @ts-ignore
      const formatted = Postcode.toJson(address);
      assert.property(formatted, "codes");
      // @ts-ignore
      assert.equal(formatted.codes.admin_district, address.admin_district_id);
      // @ts-ignore
      assert.equal(formatted.codes.admin_county, address.admin_county_id);
      // @ts-ignore
      assert.equal(formatted.codes.admin_ward, address.admin_ward_id);
      // @ts-ignore
      assert.equal(formatted.codes.parish, address.parish_id);
      // @ts-ignore
      assert.equal(formatted.codes.ccg, address.ccg_id);
      // @ts-ignore
      assert.equal(formatted.codes.nuts, address.nuts_code);
      assert.notProperty(formatted, "id");
      assert.notProperty(formatted, "location");
      assert.notProperty(formatted, "pc_compact");
      assert.notProperty(formatted, "admin_district_id");
      assert.notProperty(formatted, "admin_county_id");
      assert.notProperty(formatted, "admin_ward_id");
      assert.notProperty(formatted, "parish_id");
      assert.notProperty(formatted, "ccg_id");
      assert.notProperty(formatted, "nuts_id");
      assert.notProperty(formatted, "nuts_code");
    });
  });

  describe("#find", () => {
    it("should return postcode with the right attributes", async () => {
      const result = await Postcode.find(testPostcode);
      assert.equal(result.postcode, testPostcode);
      helper.isRawPostcodeObjectWithFC(result);
    });
    it("should return null for null/undefined postcode search", async () => {
      const result = await Postcode.find(null);
      assert.isNull(result);
    });
    it("returns null if invalid postcode", async () => {
      const result = await Postcode.find("1");
      assert.isNull(result);
    });
    it("should be insensitive to space", async () => {
      const result = await Postcode.find(testPostcode.replace(/\s/, ""));
      assert.equal(result.postcode, testPostcode);
    });
    it("should return null if postcode does not exist", async () => {
      const result = await Postcode.find("ID11QD");
      assert.isNull(result);
    });
  });

  describe("loadPostcodeIds", () => {
    it("loads a complete array of postcode IDs", async () => {
      await Postcode.loadPostcodeIds();
      // @ts-ignore
      assert.isArray(Postcode.idCache[undefined]);
      // @ts-ignore
      assert.isTrue(Postcode.idCache[undefined].length > 0);
    });
    it("loads IDs by outcode if specified", async () => {
      const outcode = "AB10";
      await Postcode.loadPostcodeIds(outcode);
      assert.isArray(Postcode.idCache[outcode]);
      assert.isTrue(Postcode.idCache[outcode].length > 0);
    });
  });

  describe("#random", () => {
    it("should return a random postcode", async () => {
      const postcode = await Postcode.random();
      helper.isRawPostcodeObjectWithFC(postcode);
    });
    describe("Outcode filter", () => {
      it("returns random postcode for within an outcode", async () => {
        const outcode = "AB10";
        const postcode = await Postcode.random(outcode);
        helper.isRawPostcodeObjectWithFC(postcode);
        assert.equal(postcode.outcode, outcode);
      });
      it("is case and space insensitive", async () => {
        const outcode = "aB 10 ";
        const postcode = await Postcode.random(outcode);
        helper.isRawPostcodeObjectWithFC(postcode);
        assert.equal(postcode.outcode, "AB10");
      });
      it("caches requests", async () => {
        const outcode = "AB12";
        const postcode = await Postcode.random(outcode);
        helper.isRawPostcodeObjectWithFC(postcode);
        assert.isTrue(Postcode.idCache[outcode].length > 0);
      });
      it("returns null if invalid outcode", async () => {
        const outcode = "BOGUS";
        const postcode = await Postcode.random(outcode);
        assert.isNull(postcode);
      });
    });
  });

  describe("#randomFromIds", () => {
    before(async () => {
      await Postcode.loadPostcodeIds();
    });

    it("should return a random postcode using an in memory ID store", async () => {
      const postcode = await Postcode.randomFromIds(
        // @ts-ignore
        Postcode.idCache[undefined]
      );
      helper.isRawPostcodeObjectWithFC(postcode);
    });
  });

  describe("#findOutcode", () => {
    it("should return the outcode with the right attributes", async () => {
      const result = await Postcode.findOutcode(testOutcode);
      assert.equal(result.outcode, testOutcode);
      assert.property(result, "northings");
      assert.property(result, "eastings");
      assert.property(result, "longitude");
      assert.property(result, "latitude");
      assert.isArray(result["admin_ward"]);
      assert.isArray(result["admin_district"]);
      assert.isArray(result["admin_county"]);
      assert.isArray(result["parish"]);
      assert.isArray(result["country"]);
    });
    it("should return null if no matching outcode", async () => {
      const result = await Postcode.findOutcode("EZ12");
      assert.equal(result, null);
    });
    it("should return null if invalid outcode", async () => {
      const result = await Postcode.findOutcode("1");
      assert.equal(result, null);
    });
    it("should return null if girobank outcode", async () => {
      const result = await Postcode.findOutcode("GIR");
      assert.equal(result, null);
    });
    it("should return null for a plausible but non-existent postcode", async () => {
      const result = await Postcode.findOutcode("EJ12");
      assert.equal(result, null);
    });
    it("should be insensitive to space", async () => {
      const result = await Postcode.findOutcode(testOutcode + "    ");
      assert.equal(result.outcode, testOutcode);
      assert.property(result, "northings");
      assert.property(result, "eastings");
      assert.property(result, "longitude");
      assert.property(result, "latitude");
    });
    it("should be insensitive to case", async () => {
      const result = await Postcode.findOutcode(testOutcode.toLowerCase());
      assert.equal(result.outcode, testOutcode);
      assert.property(result, "northings");
      assert.property(result, "eastings");
      assert.property(result, "longitude");
      assert.property(result, "latitude");
    });
  });

  describe("#nearestPostcodes", function () {
    let location: any;

    beforeEach(async () => {
      location = await helper.locationWithNearbyPostcodes();
    });

    it("should return a list of nearby postcodes", async () => {
      const params = location;
      const postcodes = await Postcode.nearestPostcodes(params);
      assert.isArray(postcodes);
      postcodes.forEach((p) => helper.isRawPostcodeObjectWithFCandDistance(p));
    });
    it("should be sensitive to limit", async () => {
      const params = {
        longitude: location.longitude,
        latitude: location.latitude,
        limit: "1",
      };
      const postcodes = await Postcode.nearestPostcodes(params);
      assert.isArray(postcodes);
      assert.equal(postcodes.length, 1);
      postcodes.forEach((p) => helper.isRawPostcodeObjectWithFCandDistance(p));
    });
    it("should be sensitive to distance param", async () => {
      const nearby = {
        longitude: location.longitude,
        latitude: location.latitude,
      };
      const farAway = {
        longitude: location.longitude,
        latitude: location.latitude,
        radius: "1000",
      };
      const postcodes = await Postcode.nearestPostcodes(nearby);
      const farawayPostcodes = await Postcode.nearestPostcodes(farAway);
      assert.isTrue(farawayPostcodes.length >= postcodes.length);
    });
    it("should throw error if limit is invalid", async () => {
      const params = {
        longitude: location.longitude,
        latitude: location.latitude,
        limit: "Bogus",
      };
      try {
        await Postcode.nearestPostcodes(params);
      } catch (error) {
        assert.instanceOf(error, PostcodesioHttpError);
      }
    });
    it("should throw error for invalid radius", async () => {
      const nearby = {
        longitude: location.longitude,
        latitude: location.latitude,
        radius: "BOGUS",
      };
      try {
        await Postcode.nearestPostcodes(nearby);
      } catch (error) {
        assert.instanceOf(error, PostcodesioHttpError);
      }
    });
    it("should raise an error if invalid longitude", async () => {
      const params = {
        longitude: "Bogus",
        latitude: location.latitude,
      };
      try {
        await Postcode.nearestPostcodes(params);
      } catch (error) {
        assert.isNotNull(error);
        assert.match(error.message, /Invalid longitude\/latitude submitted/i);
      }
    });
    it("should raise an error if invalid latitude", async () => {
      const params = {
        longitude: location.longitude,
        latitude: "Bogus",
      };
      try {
        await Postcode.nearestPostcodes(params);
      } catch (error) {
        assert.isNotNull(error);
        assert.match(error.message, /Invalid longitude\/latitude submitted/i);
      }
    });
    describe("Wide Search", () => {
      let params: any;
      beforeEach(() => {
        params = {
          longitude: -2.12659411941741,
          latitude: 57.2465923827836,
        };
      });
      it("performs an incremental search if flag is passed", async () => {
        const postcodes = await Postcode.nearestPostcodes(params);
        assert.isNull(postcodes);
        params.wideSearch = true;
        const secondPostcodes = await Postcode.nearestPostcodes(params);
        assert.equal(secondPostcodes.length, 10);
      });
      it("performs an incremental search if 'widesearch' flag is passed", async () => {
        const postcodes = await Postcode.nearestPostcodes(params);
        assert.isNull(postcodes);
        params.widesearch = true;
        const secondPostcodes = await Postcode.nearestPostcodes(params);
        assert.equal(secondPostcodes.length, 10);
      });
      it("returns null if point is too far from nearest postcode", async () => {
        params = {
          longitude: 0,
          latitude: 0,
          wideSearch: true,
        };
        const postcodes = await Postcode.nearestPostcodes(params);
        assert.isNull(postcodes);
      });
      it("resets limit to a maximum of 10 if it is exceeded", async () => {
        params.wideSearch = true;
        params.limit = 20;
        const postcodes = await Postcode.nearestPostcodes(params);
        assert.equal(postcodes.length, 10);
      });
      it("maintains limit if less than 10", async () => {
        const limit = 2;
        params.wideSearch = true;
        params.limit = limit;
        const postcodes = await Postcode.nearestPostcodes(params);
        assert.equal(postcodes.length, limit);
      });
    });
  });
});
