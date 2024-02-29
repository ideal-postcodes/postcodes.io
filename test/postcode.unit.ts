import * as path from "path";
import { assert } from "chai";
import { PostcodeTuple } from "../src/app/models/postcode";
import * as helper from "./helper/index";
import { PostcodesioHttpError } from "../src/app/lib/errors";
const seedFilePath = path.resolve(__dirname, "./seed/postcode.csv");
const Postcode = helper.Postcode;
import { query } from "../src/app/models/base";

describe("Postcode Model", function () {
  let testPostcode: string, testOutcode: string;

  before(async function () {
    this.timeout(0);
    await helper.clearPostcodeDb();
    await helper.seedPostcodeDb();
  });

  beforeEach(async () => {
    const result = await helper.lookupRandomPostcode();
    if (result === null) throw new Error("No postcode found");
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
        assert.isTrue(result.rows[0].count > 0);
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
      const address: PostcodeTuple = {
        id: 3777,
        location: "0101000020E610000018963FDF164C01C00B98C0ADBB934C40",
        postcode: "AB16 6RA",
        pc_compact: "AB166RA",
        local_enterprise_partnership: null,
        local_enterprise_partnership_2: null,
        police_force_area: "Scotland",
        cancer_alliance: null,
        integrated_care_board_id: null,
        integrated_care_board: null,
        census_lsoa_2021: null,
        census_msoa_2021: null,
        county: null,
        county_electoral_division: null,
        ward: "Kingswells/Sheddocksley/Summerhill",
        parish: null,
        health_area: "Grampian",
        nhs_er: null,
        country: "Scotland",
        region: null,
        standard_statistical_region: null,
        constituency: "Aberdeen North",
        european_electoral_region: "Scotland",
        local_learning: "Aberdeen City and Shire",
        travel_to_work_area: "Aberdeen",
        primary_care_trust: "Aberdeen City Community Health Partnership",
        international_territorial_level: null,
        international_territorial_level_id: null,
        statistical_ward_2005: null,
        census_area_statistics: "Summerhill",
        national_park: null,
        census_lsoa_2001: null,
        census_msoa_2001: null,
        census_oac_2001_supergroup: "Blue collar communites",
        census_oac_2001_group: "Younger blue collar",
        census_oac_2001_subgroup: "Younger blue collar (2)",
        census_oac_2011_supergroup: "Hard-pressed living",
        census_oac_2011_group: "Challenged terraced workers",
        census_oac_2011_subgroup: "Hard pressed rented terraces",
        local_authority: "Aberdeen City",
        census_lsoa_2011: null,
        census_msoa_2011: null,
        ccg_id: null,
        ccg: null,
        built_up_area: null,
        built_up_area_subdivision: null,
        outcode: "AB16",
        postcode_7: "AB166RA",
        postcode_8: "AB16 6RA",
        postcode_var: "AB16 6RA",
        date_of_introduction: "199606",
        date_of_termination: null,
        county_code: "S99999999",
        county_electoral_division_code: "S99999999",
        local_authority_code: "S12000033",
        ward_code: "S13002837",
        parish_code: "S99999999",
        postcode_user: "0",
        eastings: 390289,
        northings: 807044,
        positional_quality: 1,
        health_area_code: "S08000020",
        nhs_er_code: "S99999999",
        country_code: "S92000003",
        region_code: "S99999999",
        standard_statistical_region_code: "0",
        constituency_code: "S14000001",
        european_electoral_region_code: "S15000001",
        local_learning_code: "S09000001",
        travel_to_work_area_code: "S22000047",
        primary_care_trust_code: "S03000012",
        international_territorial_level_code: "S30000026",
        statistical_ward_2005_code: "99ZZ00",
        census_output_area_2001_code: "S00000917",
        census_area_statistics_code: "01C14",
        national_park_code: "S99999999",
        census_lsoa_2001_code: "S01000136",
        census_msoa_2001_code: "S02000025",
        census_urban_rural_indicator_2001_code: "1",
        census_oac_2001_code: "1B2",
        census_oa_2011_code: "S00089932",
        census_lsoa_2011_code: "S01006703",
        census_msoa_2011_code: "S02001270",
        census_wz_2011_code: "S34003114",
        ccg_code: "S03000012",
        built_up_area_code: "S99999999",
        built_up_area_subdivision_code: "S99999999",
        census_urban_rural_indicator_2011_code: "1",
        census_oac_2011_code: "8B2",
        latitude: 57.154165,
        longitude: -2.162153,
        local_enterprise_partnership_code: "S99999999",
        local_enterprise_partnership_2_code: "S99999999",
        police_force_area_code: "S23000009",
        index_of_multiple_deprivation: 1919,
        cancer_alliance_code: "S99999999",
        integrated_care_board_code: "S99999999",
        census_oa_2021_code: null,
        census_lsoa_2021_code: null,
        census_msoa_2021_code: null,
      };
      assert.deepEqual(Postcode.toJson(address), {
        postcode: "AB16 6RA",
        quality: 1,
        eastings: 390289,
        northings: 807044,
        country: "Scotland",
        nhs_ha: null,
        longitude: -2.162153,
        latitude: 57.154165,
        european_electoral_region: "Scotland",
        primary_care_trust: "Aberdeen City Community Health Partnership",
        region: null,
        lsoa: null,
        msoa: null,
        incode: "6RA",
        outcode: "AB16",
        parliamentary_constituency: "Aberdeen North",
        admin_district: "Aberdeen City",
        parish: null,
        admin_county: null,
        date_of_introduction: "199606",
        admin_ward: "Kingswells/Sheddocksley/Summerhill",
        ced: null,
        ccg: null,
        nuts: null,
        pfa: "Scotland",
        codes: {
          admin_district: "S12000033",
          admin_county: "S99999999",
          admin_ward: "S13002837",
          parish: "S99999999",
          parliamentary_constituency: "S14000001",
          ccg: null,
          ccg_id: "S03000012",
          ced: "S99999999",
          nuts: "S30000026",
          lsoa: null,
          msoa: null,
          lau2: null,
          pfa: "S23000009",
        },
      });
    });
  });

  describe("#find", () => {
    it("should return postcode with the right attributes", async () => {
      const result = await Postcode.find(testPostcode);
      if (result === null) throw new Error("No postcode found");
      assert.equal(result.postcode, testPostcode);
      helper.isRawPostcodeObjectWithFC(result);
    });
    it("returns null if invalid postcode", async () => {
      const result = await Postcode.find("1");
      assert.isNull(result);
    });
    it("should be insensitive to space", async () => {
      const result = await Postcode.find(testPostcode.replace(/\s/, ""));
      if (result === null) throw new Error("No postcode found");
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
        if (postcode === null) throw new Error("No postcode found");
        helper.isRawPostcodeObjectWithFC(postcode);
        assert.equal(postcode.outcode, outcode);
      });

      it("is case and space insensitive", async () => {
        const outcode = "aB 10 ";
        const postcode = await Postcode.random(outcode);
        if (postcode === null) throw new Error("No postcode found");
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
      if (result === null) throw new Error("No outcode found");
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
      assert.isArray(result["parliamentary_constituency"]);
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
      if (result === null) throw new Error("No postcode found");
      assert.equal(result.outcode, testOutcode);
      assert.property(result, "northings");
      assert.property(result, "eastings");
      assert.property(result, "longitude");
      assert.property(result, "latitude");
    });
    it("should be insensitive to case", async () => {
      const result = await Postcode.findOutcode(testOutcode.toLowerCase());
      if (result === null) throw new Error("No postcode found");
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
