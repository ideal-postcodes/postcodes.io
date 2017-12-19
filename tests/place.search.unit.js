"use strict";

const fs = require("fs");
const path = require("path");
const async = require("async");
const assert = require("chai").assert;
const parse = require('csv-parse/lib/sync');
const helper = require(`${__dirname}/helper`);
const env = process.env.NODE_ENV || "development";
const configPath = path.join(__dirname, "../config/config.js");
const defaults = require(configPath)(env).defaults;
const searchDefaults = defaults.placesSearch;
const Place = helper.Place;

describe("Place Model", () => {
	let testPostcode, testOutcode;

	before(function (done) {
		this.timeout(0);
		async.series([
			helper.clearPostcodeDb,
			helper.seedPostcodeDb
		], done);
	});

	after(helper.clearPostcodeDb);
	
	const searchMethods = [{
		name: "Prefix Search",
		fn: Place._prefixSearch.bind(Place)
	}, {
		name: "Terms Search",
		fn: Place._termsSearch.bind(Place)
	}];

	const testQueries = [
		"taobh a chaolais",
		"llwyn y groes",
		"corston"
	];

	searchMethods.forEach(method => {
		const fn = method.fn;
		describe(`${method.name}`, () => {
			testQueries.forEach(testQuery => {
				it (`finds exact matches on query: ${testQuery}`, done => {
					fn({name: testQuery}, (error, results) => {
						if (error) return done(error);
						assert.equal(results.length, 1);
						results.forEach(helper.isRawPlaceObject);
						assert.equal(results[0].name_1_search, testQuery);
						done();
					});
				});
			});
		});
	});

	describe("_prefixSearch", () => {
		const testQueries = ["be", "s", "br"];
		testQueries.forEach(query => {
			it (`finds incomplete words. like '${query}'`, done => {
				Place._prefixSearch({name: query}, (err, results) => {
					if (err) return done(err);
					assert(results.length > 0);
					results.forEach(helper.isRawPlaceObject);
					results.forEach(result => {
						assert(result.name_1_search.startsWith(query));
					});
					done();
				});
			});
		});
	});

	describe("_termsSearch", () => {
		it ("matches prepositions like 'of'", done => {
			Place._termsSearch({name: "of"}, (err, results) => {
				if (err) return done(err);
				assert(results.length > 0);
				results.forEach(helper.isRawPlaceObject);
				results.forEach(result => {
					assert(result.name_1_search.includes("of"));
				})
				done();
			});
		});
	});
	
	describe("#search", () => {
		it ("returns a list of places for given search term", done => {
			Place.search({ name: "b" }, (error, results) => {
				if (error) return done(error);
				results.forEach(helper.isRawPlaceObject);
				done();
			});
		});
		it ("returns null if no query", done => {
			Place.search({}, (error, results) => {
				if (error) return done(error);
				assert.isNull(results);
				done();
			});
		});
		it ("is sensitive to limit", done => {
			Place.search({ 
				name: "b",
				limit: 1
			}, (error, results) => {
				if (error) return done(error);
				assert.equal(results.length, 1);
				results.forEach(helper.isRawPlaceObject);
				done();
			});
		});
		it ("returns up to 10 results by default", done => {
			Place.search({ name: "b" }, (error, results) => {
				if (error) return done(error);
				assert.equal(results.length, 10);
				results.forEach(helper.isRawPlaceObject);
				done();
			});
		});
		it ("sets limit to default maximum if it's greater than it", done => {
			const searchDefaultMax = searchDefaults.limit.MAX;
			searchDefaults.limit.MAX = 5
			Place.search({ 
				name: "b",
			 	limit: 1000
			}, (error, results) => {
				if (error) return done(error);
				assert.equal(results.length, 5);
				results.forEach(helper.isRawPlaceObject);
				searchDefaults.limit.MAX = searchDefaultMax;
				done();
			});
		});
		it ("uses default limit if invalid limit supplied", done => {
			Place.search({ 
				name: "b",
				limit: -1 
			}, (error, results) => {
				if (error) return done(error);
				assert.equal(results.length, 10);
				results.forEach(helper.isRawPlaceObject);
				done();
			});
		});
		it ("searches with name_2", done => {
			const name = "East Kilbride";
			Place.search({ name: name }, (error, results) => {
					if (error) return done(error);
					assert.equal(results.length, 1);
					results.forEach(helper.isRawPlaceObject);
					assert.equal(results[0].name_2, name);
					done();
				});
		});
		describe("result specs", () => {
			it ("returns names with apostrophes", done => {
				const name = "Taobh a' Chaolais";
				Place.search({ 
					name: name.replace(/'/g, "")
				}, (error, results) => {
					if (error) return done(error);
					assert.equal(results.length, 1);
					results.forEach(helper.isRawPlaceObject);
					assert.equal(results[0].name_1, name);
					done();
				});
			});
			it ("returns names with non-ascii characters", done => {
				const name = "Mynydd-llêch";
				Place.search({ 
					name: name.replace("ê", "e") 
				}, (error, results) => {
					if (error) return done(error);
					assert.equal(results.length, 1);
					results.forEach(helper.isRawPlaceObject);
					assert.equal(results[0].name_1, name);
					done();
				});
			});
			it ("returns names with hyphens", done => {
				const name = "Llwyn-y-groes";
				Place.search({ 
					name: name.replace(/-/g, " ") 
				}, (error, results) => {
					if (error) return done(error);
					assert.equal(results.length, 1);
					results.forEach(helper.isRawPlaceObject);
					assert.equal(results[0].name_1, name);
					done();
				});
			});
			it ("successfully matches where query is middle word", done => {
				const query = "of";
				Place.search({ 
					name: query
				}, (error, results) => {
					if (error) return done(error);
					assert(results.length > 0);
					results.forEach(helper.isRawPlaceObject);
					results.forEach(result => {
						assert(result.name_1_search.includes(query));
					});
					done();
				});
			});
			it ("returns null if both prefix and terms search fail", done => {
				const query = "this is never gonna get matched";
				Place.search({ 
					name: query
				}, (error, results) => {
					if (error) return done(error);
					assert.isNull(results);
					done();
				});
			});
		});
		describe("query specs", () => {
			it ("is case insensitive", done => {
				const name = "Corston";
				Place.search({ 
					name: name.toUpperCase() 
				}, (error, results) => {
					if (error) return done(error);
					assert.equal(results.length, 1);
					results.forEach(helper.isRawPlaceObject);
					assert.equal(results[0].name_1, name);
					done();
				});
			});
			it ("handles apostrophes", done => {
				const name = "Taobh a' Chaolais";
				Place.search({ 
					name: name
				}, (error, results) => {
					if (error) return done(error);
					assert.equal(results.length, 1);
					results.forEach(helper.isRawPlaceObject);
					assert.equal(results[0].name_1, name);
					done();
				});
			});
			it ("handles non-ascii characters", done => {
				const name = "Mynydd-llêch";
				Place.search({ name: name }, (error, results) => {
					if (error) return done(error);
					assert.equal(results.length, 1);
					results.forEach(helper.isRawPlaceObject);
					assert.equal(results[0].name_1, name);
					done();
				});
			});
			it ("handles hyphens as spaces", done => {
				const name = "Llwyn-y-groes";
				Place.search({ name: name }, (error, results) => {
					if (error) return done(error);
					assert.equal(results.length, 1);
					results.forEach(helper.isRawPlaceObject);
					assert.equal(results[0].name_1, name);
					done();
				});
			});
		});
	});	
});
