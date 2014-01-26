var assert = require("chai").assert,
		helper = require(__dirname + "/helper");

var Base = helper.Base;

describe("Base model", function () {
	describe("Connect", function () {
		it ("should connect to postgresql database", function (done) {
			var pg = Base.connect(helper.config, function (error, client, returnClient) {
				if (error) throw error;
				assert.isNotNull(client);
				returnClient();
				done();
			});
		});
		it ("should cache connection for each request");
	});
	describe("Base model instance methods", function () {
		describe("#_query", function () {
			it ("should execute a query", function (done) {
				var base = new Base.Base();
				base._query("SELECT * FROM pg_tables", function (error, result) {
					if (error) throw error;
					assert.isArray(result);
					done();
				});
			});
			it ("should throw an error if not configured");
		});
	});

	describe("#_create", function () {

	});

	describe("#_read", function () {

	});

	describe("#_update", function () {

	});

	describe("#_destroy", function () {

	});

	describe("#all", function () {

	});

	describe("#_createRelation", function () {
		var customRelation;

		before(function () {
			customRelation = helper.getCustomRelation();
		});

		it ("should create a table with the right attributes", function (done) {
			customRelation._createRelation(function (error, result) {
				if (error) throw error;
				done();
			});
		});

		after(function (done) {
			customRelation._destroyRelation(function (error, result) {
				if (error) throw error();
				done();
			});
		});
	});

	describe("#_destroyRelation", function () {
		var customRelation;

		before(function (done) {
			customRelation = helper.getCustomRelation();
			customRelation._createRelation(function (error, result) {
				if (error) throw error;
				done();
			});
		});

		it ("should delete the relation", function (done) {
			customRelation._destroyRelation(function (error, result) {
				if (error) throw error;
				done();
			});
		});

	});
});