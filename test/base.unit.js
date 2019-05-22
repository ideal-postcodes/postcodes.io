"use strict";

const helper = require("./helper");
const { assert } = require("chai");
const {
  Base,
	extractOnspdVal
} = require("../app/models/base.js");

describe("Base model", function () {
	describe("Base model instance methods", function () {
		describe("#_query", function () {
			it ("should execute a query", function (done) {
				const base = new Base();
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

	describe("extractOnspdVal", () => {
		it ("extracts correct ONSPD val from row", () => {
			const row = ["foo", "bar", "baz"];
			assert.equal(extractOnspdVal(row, "pcd"), "foo");
			assert.equal(extractOnspdVal(row, "pcd2"), "bar");
			assert.equal(extractOnspdVal(row, "pcds"), "baz");
		});
	});
});
