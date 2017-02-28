"use strict";

const fs = require("fs");
const path = require("path");
const async = require("async");
const assert = require("chai").assert;
const helper = require(`${__dirname}/helper`);

const Model = helper.Ward;

const data = JSON.parse(fs.readFileSync(path.join(helper.rootPath, "data/"+ Model.relation +".json")));
let dataCount = 0;

for (let d in data) {
	if (data.hasOwnProperty(d)) {
		dataCount += 1;
	}
}

describe(`${Model.relation} model`, () => {
	before(function(done) {
		this.timeout(0);
		helper.clearPostcodeDb((error) => {
			if (error) return done(error);
			helper.seedPostcodeDb(done);
		});
	});

	// Rebuild table after tests
	after(function(done) {
		this.timeout(0);
		Model._setupTable(done);
	});

	describe("seedData", () => {
		// Recreate clean table
		before(done => {
			Model._destroyRelation(error => {
				if (error) return done(error);
				Model._createRelation(done);
			});
		});
		it ("loads correct data from data directory", function(done) {
			this.timeout(0);
			Model.seedData(error => {
				if (error) return done(error);
				Model._query(`SELECT count(*) FROM ${Model.relation}` , (error, result) => {
					if (error) return done(error);
					assert.equal(result.rows[0].count, dataCount);
					done();
				});
			});
		});
	});

	describe("_setupTable", () => {
		it ("creates a table, associated indexes and populates with data", function(done) {
			this.timeout(0);
			Model._setupTable(error => {
				if (error) return done(error);
				Model._query(`SELECT count(*) FROM ${Model.relation}`, (error, result) => {
					if (error) return done(error);
					assert.equal(result.rows[0].count, dataCount);
					done();
				});
			});
		});
	});
});