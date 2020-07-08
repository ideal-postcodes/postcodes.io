"use strict";

const path = require("path");
const async = require("async");
const assert = require("chai").assert;
const helper = require("./helper");

const Outcode = helper.Outcode;

describe("Outcode Model", () => {
  before(async function () {
    this.timeout(0);
    await helper.clearPostcodeDb();
    await helper.seedPostcodeDb();
  });

  after(async () => helper.clearPostcodeDb());

  describe("populateLocation", () => {
    before(async () => {
      await Outcode.destroyRelation();
      await Outcode.createRelation();
      await Outcode.seedData();
    });

    after(async () => Outcode.setupTable());

    it("generates a location using longitude and latitude", async () => {
      const outcode = "AA10";
      const record = {
        outcode: outcode,
        longitude: -2.12002322052475,
        latitude: 57.135241767364,
        northings: 804931,
        eastings: 392833,
        admin_district: ["Aberdeen City"],
        parish: [],
        admin_county: [],
        admin_ward: ["Torry/Ferryhill"],
      };
      await Outcode.create(record);
      await Outcode.populateLocation();
      const code = await Outcode.find(outcode);
      assert.isNotNull(code.location);
    });
    it("does not generate a location when northings = 0, eastings = 0", async () => {
      const outcode = "AA11";
      const record = {
        outcode: outcode,
        longitude: -2.12002322052475,
        latitude: 57.135241767364,
        northings: 0,
        eastings: 0,
        admin_district: ["Aberdeen City"],
        parish: [],
        admin_county: [],
        admin_ward: ["Torry/Ferryhill"],
      };
      await Outcode.create(record);
      await Outcode.populateLocation();
      const code = await Outcode.find(outcode);
      assert.isNull(code.location);
    });
  });

  describe("seedData", () => {
    before(async () => {
      await Outcode.destroyRelation();
      await Outcode.createRelation();
    });

    after(async () => Outcode.setupTable());

    it("seeds outcode table", async function () {
      this.timeout(0);
      const result = await Outcode.all();
      assert.equal(result.rows.length, 0);
      await Outcode.seedData();
      const outcodes = await Outcode.all();
      assert.isTrue(outcodes.rows.length > 0);
    });
  });

  describe("setupTable", () => {
    before(async () => Outcode.destroyRelation);

    after(async () => Outcode.setupTable());

    it("creates and populates outcode table", async () => {
      await Outcode.setupTable();
      const outcodes = await Outcode.all();
      assert.isTrue(outcodes.rows.length > 0);
    });
  });

  describe("find", () => {
    before(async () => Outcode.setupTable());

    after(async () => Outcode.setupTable());

    it("returns outcode", async () => {
      const term = "AB10";
      const outcode = await Outcode.find(term);
      assert.equal(outcode.outcode, term);
    });
    it("returns null if not string", async () => {
      let term;
      const outcode = await Outcode.find(term);
      assert.isNull(outcode);
    });
    it("returns null if outcode does not exist", async () => {
      const term = "ZZ10";
      const outcode = await Outcode.find(term);
      assert.isNull(outcode);
    });
    it("is case insensitive", async () => {
      const term = "ab10";
      const outcode = await Outcode.find(term);
      assert.equal(outcode.outcode, term.toUpperCase());
    });
    it("is space insensitive", async () => {
      const term = " AB 10 ";
      const outcode = await Outcode.find(term);
      assert.equal(outcode.outcode, term.replace(/\s/g, ""));
    });
  });

  describe("nearest", () => {
    let params;

    beforeEach(() => {
      params = {
        longitude: -2.09301393644196,
        latitude: 57.1392691975667,
      };
    });

    it("returns a list of nearby outcodes", async () => {
      const outcodes = await Outcode.nearest(params);
      assert.isTrue(outcodes.length > 0);
      outcodes.forEach((o) => helper.isRawOutcodeObject(o));
    });
    it("is sensitive to limit", async () => {
      params.limit = 1;
      const outcodes = await Outcode.nearest(params);
      assert.equal(outcodes.length, 1);
      outcodes.forEach((o) => helper.isRawOutcodeObject(o));
    });
    it("is sensitive to radius", async () => {
      params.radius = 1000;
      const outcodes = await Outcode.nearest(params);
      params.radius = 25000;
      const newOutcodes = await Outcode.nearest(params);
      assert.isTrue(newOutcodes.length > outcodes.length);
    });
    it("raises an error if invalid longitude", async () => {
      params.longitude = "foo";
      try {
        await Outcode.nearest(params);
      } catch (error) {
        assert.isNotNull(error);
        assert.match(error.message, /invalid\slongitude/i);
      }
    });
    it("raises an error if invalid latitude", async () => {
      params.latitude = "foo";
      try {
        await Outcode.nearest(params);
      } catch (error) {
        assert.isNotNull(error);
        assert.match(error.message, /invalid\slatitude/i);
      }
    });
  });
});
