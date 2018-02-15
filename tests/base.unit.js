"use strict";

const helper = require("./helper");
const assert = require("chai").assert;
const path = require("path");
const rootPath = path.join(__dirname, "../");
const getLocation = require(path.join(rootPath, "app/models")).getLocation;
const Base = helper.Base;

describe("Base model", function () {
	describe("Base model instance methods", function () {
		describe("#_query", function () {
			it ("should execute a query", function (done) {
				var base = new Base.Base();
				base._query("SELECT * FROM pg_tables", function (error, result) {
					if (error) return done(error);
					assert.isArray(result.rows);
					done();
				});
			});
		});
	});

	describe("CRUD methods", function () {
		var customRelation;

		before(function (done) {
			customRelation = helper.getCustomRelation();
			customRelation._createRelation(done);
		});

		after(function (done) {
			customRelation._destroyRelation(done);
		});

		describe("#_create", function () {
			it ("should return an error if property no in schema", function (done) {
				customRelation._create({
					"bogus" : "bogusfield"
				}, function (error, result) {
					assert.match(error.message, /Could not create record/);
					done();
				});
			});
			it ("should create a new record", function (done) {
				customRelation._create({
					somefield: "unique"
				}, function (error, result) {
					if (error) return done(error);
					done();
				});
			});
		});

		describe("#all", function () {
			it ("should return list of all records", function (done) {
				customRelation.all(function (error, result) {
					if (error) return done(error);
					var containsUnique = result.rows.some(function (elem) {
						return elem.somefield === "unique";
					});
					assert.isTrue(result.rows.length > 0);
					assert.isTrue(containsUnique);
					done();
				});
			});
		});
	});

	describe("#_createRelation", function () {
		var customRelation;

		before(function () {
			customRelation = helper.getCustomRelation();
		});

		it ("should create a table with the right attributes", function (done) {
			customRelation._createRelation(function (error, result) {
				if (error) return done(error);
				done();
			});
		});

		after(function (done) {
			customRelation._destroyRelation(function (error, result) {
				if (error) return done(error)();
				done();
			});
		});
	});

	describe("#_destroyRelation", function () {
		var customRelation;

		before(function (done) {
			customRelation = helper.getCustomRelation();
			customRelation._createRelation(function (error, result) {
				if (error) return done(error);
				done();
			});
		});

		it ("should delete the relation", function (done) {
			customRelation._destroyRelation(function (error, result) {
				if (error) return done(error);
				done();
			});
		});
	});

	describe("#_csvSeed", done => {
		let customRelation;

		before(done => {
			customRelation = helper.getCustomRelation();
			customRelation._createRelation(done);
		});

		after(done => customRelation._destroyRelation(done));

		it ("should seed the relation table with data", done => {
			customRelation._csvSeed({
				filepath: helper.seedPaths.customRelation, 
				columns: "someField"
			}, (error, result) => {
				if (error) return done(error);
				customRelation.all((error, data) => {
					if (error) return done(error);
					var hasLorem = data.rows.some(function (elem) {
						return elem.somefield === "Lorem";
					});
					assert.isTrue(hasLorem);
					done();
				});
			});		
		});
	});

	describe("#clear", function (done) {
		var customRelation;

		before(done => {
			customRelation = helper.getCustomRelation();
			customRelation._createRelation((error, result) => {
				if (error) return done(error);
				customRelation._csvSeed({
					filepath: helper.seedPaths.customRelation, 
					columns: "someField"
				}, (error, result) => {
					if (error) return done(error);
					customRelation.all((error, data) => {
						if (error) return done(error);
						assert.isTrue(data.rows.length > 0);
						done();
					});
				});
			});
		});

		after(done => customRelation._destroyRelation(done));

		it ("should clear the table", function (done) {
			customRelation.clear(function (error, result) {
				if (error) return done(error);
				customRelation.all(function (error, data) {
					if (error) return done(error);
					assert.equal(data.rows.length, 0);
					done();
				});
			});
		});
	});
});

describe("#getLocation", () => {
	it ("returns empty locations if eastings/northings is empty string", () => {
		const expectedLocation = {longitude: "", latitude: ""};
		let location = getLocation({eastings: "", northings: "43"});
		assert.deepEqual(location, expectedLocation);
		location = getLocation({eastings: "43", northings: ""});
		assert.deepEqual(location, expectedLocation);
	});
	it ("returns different coordinates, if specified as Ireland", () => {
		let locationNotIreland = getLocation({eastings: "334316", northings: "374675"});
		let locationIreland = getLocation({eastings: "334316", northings: "374675", country: "N92000002"});
		assert.notDeepEqual(locationIreland, locationNotIreland);
	});
});