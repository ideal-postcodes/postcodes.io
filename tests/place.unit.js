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
				assert.equal(results.length, 10);
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

	describe("contains", () => {
		let validPlace;
		before(done => {
			Place.random((error, place) => {
				if (error) return done(error);
				validPlace = place;
				done();
			});
		});

		it ("returns a list of places which contain point", done => {
			Place.contains({
				longitude: validPlace.longitude,
				latitude: validPlace.latitude
			}, (error, places) => {
				if (error) return done(error);
				assert.isTrue(places.length > 0);
				const result = places[0];
				helper.isRawPlaceObject(result);
				assert.equal(result.code, validPlace.code);
				done();
			});
		});
		it ("orders results by distance", done => {
			Place.contains({
				longitude: -3.2137291,
				latitude: 58.96804
			}, (error, places) => {
				if (error) return done(error);
				places.map(p => p.distance).reduce((acc, curr) => {
					assert.isTrue(curr >= acc);
					return curr;
				}, 0);
				done();
			});
		});
		it ("is sensitive to limit", done => {
			Place.contains({
				longitude: -3.2137291,
				latitude: 58.96804,
				limit: 1
			}, (error, places) => {
				if (error) return done(error);
				assert.equal(places.length, 1);
				const result = places[0];
				helper.isRawPlaceObject(result);
				done();
			});
		});
		it ("uses default limit if invalid", done => {
			Place.contains({
				longitude: 0,
				latitude: 0,
				limit: "Foo"
			}, error => {
				assert.isNull(error);
				done();
			});
		});
		it ("uses default limit greater than 100", done => {
			Place.contains({
				longitude: 0,
				latitude: 0,
				limit: 101
			}, error => {
				assert.isNull(error);
				done();
			});
		});
		it ("returns an error if invalid longitude", done => {
			Place.contains({
				longitude: "foo",
				latitude: 0
			}, error => {
				assert.match(error.message, /invalid\slongitude/i);
				done();
			});
		});
		it ("returns an error if invalid latitude", done => {
			Place.contains({
				longitude: 0,
				latitude: "foo"
			}, error => {
				assert.match(error.message, /invalid\slatitude/i);
				done();
			});
		});
	});

	describe("nearest", () => {
		let validPlace;
		before(done => {
			Place.random((error, place) => {
				if (error) return done(error);
				validPlace = place;
				done();
			});
		});

		it ("returns a list of places which contain point", done => {
			Place.nearest({
				longitude: validPlace.longitude,
				latitude: validPlace.latitude
			}, (error, places) => {
				if (error) return done(error);
				assert.isTrue(places.length > 0);
				const result = places[0];
				helper.isRawPlaceObject(result);
				assert.equal(result.code, validPlace.code);
				done();
			});
		});
		it ("orders results by distance", done => {
			Place.nearest({
				longitude: -3.2137291,
				latitude: 58.96804
			}, (error, places) => {
				if (error) return done(error);
				places.map(p => p.distance).reduce((acc, curr) => {
					assert.isTrue(curr >= acc);
					return curr;
				}, 0);
				done();
			});
		});
		it ("is sensitive to limit", done => {
			Place.nearest({
				longitude: -3.2137291,
				latitude: 58.96804,
				limit: 1
			}, (error, places) => {
				if (error) return done(error);
				assert.equal(places.length, 1);
				const result = places[0];
				helper.isRawPlaceObject(result);
				done();
			});
		});
		it ("uses default limit if invalid", done => {
			Place.nearest({
				longitude: 0,
				latitude: 0,
				limit: "Foo"
			}, error => {
				assert.isNull(error);
				done();
			});
		});
		it ("uses default limit greater than 100", done => {
			Place.nearest({
				longitude: 0,
				latitude: 0,
				limit: 101
			}, error => {
				assert.isNull(error);
				done();
			});
		});
		it ("uses default radius if invalid", done => {
			Place.nearest({
				longitude: 0,
				latitude: 0,
				radius: "Foo"
			}, error => {
				assert.isNull(error);
				done();
			});
		});
		it ("uses default limit greater than max default", done => {
			Place.nearest({
				longitude: 0,
				latitude: 0,
				radius: 1000000
			}, error => {
				assert.isNull(error);
				done();
			});
		});
		it ("returns an error if invalid longitude", done => {
			Place.nearest({
				longitude: "foo",
				latitude: 0
			}, error => {
				assert.match(error.message, /invalid\slongitude/i);
				done();
			});
		});
		it ("returns an error if invalid latitude", done => {
			Place.nearest({
				longitude: 0,
				latitude: "foo"
			}, error => {
				assert.match(error.message, /invalid\slatitude/i);
				done();
			});
		});
	});

	describe("toJson", () => {
		it ("formats place object for public consumption", done => {
			const testCode = "osgb4000000074559125";
			Place.findByCode(testCode, (error, place) => {
				if (error) return done(error);
				helper.isRawPlaceObject(place);
				const formatted = Place.toJson(place);
				helper.isPlaceObject(formatted);
				done();
			});
		});
	});

	describe("#random", () => {
		it ("should return a random place", done => {
			Place.random((error, place) => {
				if (error) return done(error);
				helper.isRawPlaceObject(place);
				done();
			});
		});
	});
});
