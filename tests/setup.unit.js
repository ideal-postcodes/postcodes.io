"use strict";

const { assert } = require("chai");
const {
  setupSupportTables,
  setupOutcodeTable,
  SUPPORT_TABLES,
} = require("../app/lib/setup.js");
const { series, parallel } = require("async");
const {
  listDatabaseRelations,
  clearPostcodeDb,
  seedPostcodeDb,
  Outcode,
} = require("./helper/index.js");

const clearSupportTables = () => {
  return new Promise((resolve, reject) => {
    const instructions = SUPPORT_TABLES.map(m => m._destroyRelation.bind(m));
    parallel(instructions, (error, result) => {
      if (error) return reject(error);
      return resolve(result);
    });
  });
};

describe("Setup methods", () => {
	before(function (done) {
		this.timeout(0);
		series([
			clearPostcodeDb,
			seedPostcodeDb
		], done);
	});

	after(clearPostcodeDb);

  describe("setupSupportTables", () => {
    before(async () => {
      await clearSupportTables()
    });

    after(async function () {
      this.timeout(0);
      await setupSupportTables();
    });

    it ("creates support tables", async function () {
      this.timeout(0);
      const existing = await listDatabaseRelations();   
      SUPPORT_TABLES.forEach(( { relation } ) => {
        assert.isFalse(existing.rows.some(({ Name }) => Name === relation));
      });
      await setupSupportTables();
      const created = await listDatabaseRelations();
      SUPPORT_TABLES.forEach(( { relation } ) => {
        assert.isTrue(created.rows.some(({ Name }) => Name === relation));
      });
    });
  });

  describe("setupOutcodeTable", () => {
    before(done => Outcode._destroyRelation(done));
    
    it ("creates outcode table", async () => {
      const existing = await listDatabaseRelations();
      assert.isFalse(existing.rows.some(({ Name }) => Name === "outcodes"));
      await setupOutcodeTable();
      const created = await listDatabaseRelations();
      assert.isTrue(created.rows.some(({ Name }) => Name === "outcodes"));
    });
  });
});

