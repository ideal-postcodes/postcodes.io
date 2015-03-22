var fs = require("fs");
var path = require("path");
var async = require("async");
var assert = require("chai").assert;
var helper = require(__dirname + "/helper");

/* Modify model here */
var Model = helper.Ccg;
/* Modify model here */

var data = JSON.parse(fs.readFileSync(path.join(helper.rootPath, "data/"+ Model.relation +".json")));
var dataCount = 0;

for (var d in data) {
	if (data.hasOwnProperty(d)) {
		dataCount += 1;
	}
}

describe(Model.relation + " model", function () {
	before(function (done) {
		this.timeout(0);
		helper.clearPostcodeDb(function (error, result) {
			if (error) return done(error);
			helper.seedPostcodeDb(function (error, result) {
				if (error) return done(error);
				done();
			});
		});
	});

	// Rebuild table after tests
	after(function (done) {
		this.timeout(0);
		Model._setupTable(done);
	});

	describe("seedData", function () {
		// Recreate clean table
		before(function (done) {
			Model._destroyRelation(function (error) {
				if (error) return done(error);
				Model._createRelation(done);
			});
		});
		it ("loads correct data from data directory", function (done) {
			this.timeout(0);
			Model.seedData(function (error) {
				if (error) return done(error);
				Model._query("SELECT count(*) FROM " + Model.relation , function (error, result) {
					if (error) return done(error);
					assert.equal(result.rows[0].count, dataCount);
					done();
				});
			});
		});
	});

	describe("_setupTable", function (done) {
		it ("creates a table, associated indexes and populates with data", function (done) {
			this.timeout(0);
			Model._setupTable(function (error) {
				if (error) return done(error);
				Model._query("SELECT count(*) FROM " + Model.relation , function (error, result) {
					if (error) return done(error);
					assert.equal(result.rows[0].count, dataCount);
					done();
				});
			});
		});
	});
});