var fs = require("fs");
var path = require("path");
var async = require("async");
var assert = require("chai").assert;
var helper = require(__dirname + "/helper");
var districtData = JSON.parse(fs.readFileSync(path.join(helper.rootPath, "data/districts.json")));
var districtCount = 0;

for (var d in districtData) {
	if (districtData.hasOwnProperty(d)) {
		districtCount += 1;
	}
}

var District = helper.District;

describe("District model", function () {
	before(function (done) {
		this.timeout(0);
		helper.connectToDb();
		helper.clearPostcodeDb(function (error, result) {
			if (error) return done(error);
			helper.seedPostcodeDb(function (error, result) {
				if (error) return done(error);
				done();
			});
		});
	});

	describe("seedData", function () {
		// Recreate clean district tabe
		before(function (done) {
			helper.connectToDb();
			District._destroyRelation(function (error) {
				if (error) return done(error);
				District._createRelation(done);
			});
		});
		it ("loads in district data from data directory", function (done) {
			District.seedData(function (error) {
				if (error) return done(error);
				District._query("SELECT count(*) FROM districts", function (error, result) {
					if (error) return done(error);
					assert.equal(result.rows[0].count, districtCount);
					done();
				});
			});
		});
	});

	describe("_setupTable", function (done) {
		it ("creates a table, associated indexes and populates with data", function (done) {
			District._setupTable(function (error) {
				if (error) return done(error);
				District._query("SELECT count(*) FROM districts", function (error, result) {
					if (error) return done(error);
					assert.equal(result.rows[0].count, districtCount);
					done();
				});
			});
		});
	});
});