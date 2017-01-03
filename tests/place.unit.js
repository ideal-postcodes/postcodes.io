"use strict";

const path = require("path");
const async = require("async");
const assert = require("chai").assert;
const helper = require(`${__dirname}/helper`);
		
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

	describe("#findByCode", () => {
		const testCode = "osgb4000000074559125";
		it ("returns place by code", done => {
			Place.findByCode(testCode, (error, result) => {
				if (error) return done(error);
				helper.isRawPlaceObject(result);
				done();
			});
		});
		it ("is case insensitive", done => {
			Place.findByCode(testCode.toUpperCase(), (error, result) => {
				if (error) return done(error);
				helper.isRawPlaceObject(result);
				done();
			});
		});
		it ("returns null if no match", done => {
			Place.findByCode("12", (error, result) => {
				if (error) return done(error);
				assert.isNull(result);
				done();
			});
		});
		it ("returns null if code not string", done => {
			Place.findByCode(12, (error, result) => {
				if (error) return done(error);
				assert.isNull(result);
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
				assert.isTrue(results.length < 10);
				results.forEach(helper.isRawPlaceObject);
				done();
			});
		});
		it ("uses default limit if invalid limit supplied", done => {
			Place.search({ 
				name: "b",
				limit: -1 
			}, (error, results) => {
				if (error) return done(error);
				assert.isTrue(results.length < 10);
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
