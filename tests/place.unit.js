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
	
});
