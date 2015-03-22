var path = require("path");
var async = require("async");
var assert = require("chai").assert;
var helper = require(__dirname + "/helper");
		
var Postcode = helper.Postcode;

describe("Postcode Model", function () {
	var testPostcode;

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

	beforeEach(function (done) {
		helper.lookupRandomPostcode(function (result) {
			testPostcode = result.postcode;
			testOutcode = result.outcode;
			done();	
		});
	});

	after(function (done) {
		helper.clearPostcodeDb(done);
	});

	describe("#find", function () {
		it ("should return postcode with the right attributes", function (done) {
			Postcode.find(testPostcode, function (error, result) {
				if (error) return done(error);
				assert.equal(result.postcode, testPostcode);
				helper.isRawPostcodeObject(result);
				done();
			});
		});
		it ("should return null for null/undefined postcode search", function (done) {
			Postcode.find(null, function (error, result) {
				if (error) return done(error);
				assert.isNull(result);
				done()
			});
		});
		it ("should be insensitive to space", function (done) {
			Postcode.find(testPostcode.replace(/\s/, ""), function (error, result) {
				if (error) return done(error);
				assert.equal(result.postcode, testPostcode);
				done();
			});
		});
		it ("should return null if postcode does not exist", function (done) {
			Postcode.find("ID11QD", function (error, result) {
				if (error) return done(error);
				assert.isNull(result);
				done();
			});
		});
	});

	describe("#search", function () {
		it ("should return a list of candidate postcodes for given search term", function (done) {
			testPostcode = testPostcode.slice(0, 2);
			Postcode.search(testPostcode, function (error, result) {
				if (error) return done(error);
				assert.notEqual(result.length, 0);
				result.forEach(function (postcode) {
					helper.isRawPostcodeObject(postcode);
				});
				done();
			});
		});
		it ("should be case insensitive", function (done) {
			testPostcode = testPostcode.slice(0, 2).toLowerCase();
			Postcode.search(testPostcode, function (error, result) {
				if (error) return done(error);
				assert.notEqual(result.length, 0);
				result.forEach(function (postcode) {
					helper.isRawPostcodeObject(postcode);
				});
				done();
			});
		});
		it ("should work regardless of spaces", function (done) {
			testPostcode = testPostcode.slice(0, 4).replace(" ", "");
			Postcode.search(testPostcode, function (error, result) {
				if (error) return done(error);
				assert.notEqual(result.length, 0);
				result.forEach(function (postcode) {
					helper.isRawPostcodeObject(postcode);
				});
				done();
			});
		});
		it ("should strip out non digits, numbers or spaces	for search", function (done) {
			testPostcode = testPostcode.slice(0, 2) + "[]";
			Postcode.search(testPostcode, function (error, result) {
				if (error) return done(error);
				assert.notEqual(result.length, 0);
				result.forEach(function (postcode) {
					helper.isRawPostcodeObject(postcode);
				});
				done();
			});
		});
	});

	describe("#random", function () {
		it ("should return a random postcode", function (done) {
			Postcode.random(function (error, postcode) {
				if (error) return done(error);
				helper.isRawPostcodeObject(postcode);
				done();
			});
		});
	});

	describe("#findOutcode", function () {
		it ("should return the outcode with the right attributes", function (done) {
			Postcode.findOutcode(testOutcode, function (error, result) {
				if (error) return done(error);
				assert.equal(result.outcode, testOutcode);
				assert.property(result, "northings");
				assert.property(result, "eastings");
				assert.property(result, "longitude");
				assert.property(result, "latitude");
				assert.isArray(result["admin_ward"]);
				assert.isArray(result["admin_district"]);
				assert.isArray(result["admin_county"]);
				assert.isArray(result["parish"]);
				done();
			});
		});
		it ("should return null if no matching outcode", function (done) {
			Postcode.findOutcode("BOGUSOUTCODE", function (error, result) {
				if (error) return done(error);
				assert.equal(result, null);
				done();
			});
		});
		it ("should return null for a plausible but non-existent postcode", function (done) {
			Postcode.findOutcode("EJ12", function (error, result) {
				if (error) return done(error);
				assert.equal(result, null);
				done();
			});
		});
		it ("should be insensitive to space", function (done) {
			Postcode.findOutcode(testOutcode + "    ", function (error, result) {
				if (error) return done(error);
				assert.equal(result.outcode, testOutcode);
				assert.property(result, "northings");
				assert.property(result, "eastings");
				assert.property(result, "longitude");
				assert.property(result, "latitude");
				done();
			});
		});
		it ("should be insensitive to case", function (done) {
			Postcode.findOutcode(testOutcode.toLowerCase(), function (error, result) {
				if (error) return done(error);
				assert.equal(result.outcode, testOutcode);
				assert.property(result, "northings");
				assert.property(result, "eastings");
				assert.property(result, "longitude");
				assert.property(result, "latitude");
				done();
			});
		});
	});

	describe("#_deriveMaxRange", function () {
		var postcode, location;

		beforeEach(function (done) {
			helper.locationWithNearbyPostcodes(function (error, postcode) {
				if (error) return done(error);
				location = postcode;
				done();
			});
		});

		it ("returns start range if many postcodes nearby", function (done) {
			Postcode._deriveMaxRange(location, function (error, result) {
				if (error) return done(error);
				assert.equal(result, 500);
				done();
			});
		});

		it ("returns null if nearest postcode is outside of max range", function (done) {
			location = {
				longitude: -0.12466272904588,
				latitude: 51.4998404539774
			};
			Postcode._deriveMaxRange(location, function (error, result) {
				if (error) return done(error);
				assert.isNull(result);
				done();
			});
		});

		it ("returns a range which has at least 10 postcodes", function (done) {
			location = {
				longitude: -2.12659411941741,
				latitude: 57.2465923827836
			};
			Postcode._deriveMaxRange(location, function (error, range) {
				if (error) return done(error);
				assert.isNumber(range);
				assert.isTrue(range > 500);
				done();
			});
		});
	});

	describe("#nearestPostcodes", function () {
		var location;

		beforeEach(function (done) {
			helper.locationWithNearbyPostcodes(function (error, postcode) {
				if (error) return done(error);
				location = postcode;
				done();
			});
		});

		it ("should return a list of nearby postcodes", function (done) {
			var params = location;
			
			Postcode.nearestPostcodes(params, function (error, postcodes) {
				if (error) return done(error);
				assert.isArray(postcodes);
				postcodes.forEach(function (postcode) {
					helper.isRawPostcodeObject(postcode);
				});
				done();
			});
		});
		it ("should be sensitive to limit", function (done) {
			var params = {
				longitude: location.longitude,
				latitude: location.latitude,
				limit: 1
			}
			Postcode.nearestPostcodes(params, function (error, postcodes) {
				if (error) return done(error);
				assert.isArray(postcodes);
				assert.equal(postcodes.length, 1);
				postcodes.forEach(function (postcode) {
					helper.isRawPostcodeObject(postcode);
				});
				done();
			});
		});
		it ("should be sensitive to distance param", function (done) {
			var nearby = {
					longitude: location.longitude,
					latitude: location.latitude,
				},
				farAway = {
					longitude: location.longitude,
					latitude: location.latitude,
					radius: 1000
				};

			Postcode.nearestPostcodes(nearby, function (error, postcodes) {
				if (error) return done(error);
				Postcode.nearestPostcodes(farAway, function (error, farawayPostcodes) {
					if (error) return done(error);
					assert.isTrue(farawayPostcodes.length >= postcodes.length);
					done();
				});
			});
		});
		it ("should default limit to 10 if invalid", function (done) {
			var params = {
				longitude: location.longitude,
				latitude: location.latitude,
				limit: "Bogus"
			};
			Postcode.nearestPostcodes(params, function (error, postcodes) {
				if (error) return done(error);
				assert.isTrue(postcodes.length <= 10);
				done();
			});
		});
		it ("should default radius to 100 if invalid", function (done) {
			var nearby = {
					longitude: location.longitude,
					latitude: location.latitude,
					radius: "BOGUS"
				},
				farAway = {
					longitude: location.longitude,
					latitude: location.latitude,
					radius: 1000
				};

			Postcode.nearestPostcodes(nearby, function (error, postcodes) {
				if (error) return done(error);
				Postcode.nearestPostcodes(farAway, function (error, farawayPostcodes) {
					if (error) return done(error);
					assert.isTrue(farawayPostcodes.length >= postcodes.length);
					done();
				});
			});
		});
		it ("should raise an error if invalid longitude", function (done) {
			var params = {
				longitude: "Bogus",
				latitude: location.latitude,
			};
			Postcode.nearestPostcodes(params, function (error, postcodes) {
				assert.isNotNull(error);
				assert.match(error.message, /invalid longitude/i);
				done();
			});
		});
		it ("should raise an error if invalid latitude", function (done) {
			var params = {
				longitude: location.longitude,
				latitude: "Bogus",
			};
			Postcode.nearestPostcodes(params, function (error, postcodes) {
				assert.isNotNull(error);
				assert.match(error.message, /invalid latitude/i);
				done();
			});
		});
		describe("Wide Search", function () {
			var params;
			beforeEach(function () {
				params = {
					longitude: -2.12659411941741,
					latitude: 57.2465923827836
				};
			});
			it ("performs an incremental search if flag is passed", function (done) {
				Postcode.nearestPostcodes(params, function (error, postcodes) {
					if (error) return done(error);
					assert.isNull(postcodes);
					params.wideSearch = true;
					Postcode.nearestPostcodes(params, function (error, postcodes) {
						if (error) return done(error);
						assert.equal(postcodes.length, 10);
						done();
					});
				});
			});
			it ("returns null if point is too far from nearest postcode", function (done) {
				params = {
					longitude: 0,
					latitude: 0,
					wideSearch: true
				};
				Postcode.nearestPostcodes(params, function (error, postcodes) {
					if (error) return done(error);
					assert.isNull(postcodes);
					done();
				});
			});
			it ("resets limit to a maximum of 10 if it is exceeded", function (done) {
				params.wideSearch = true;
				params.limit = 20;
				Postcode.nearestPostcodes(params, function (error, postcodes) {
					if (error) return done(error);
					assert.equal(postcodes.length, 10);
					done();
				});
			});
			it ("maintains limit if less than 10", function (done) {
				var limit = 2;
				params.wideSearch = true;
				params.limit = limit;
				Postcode.nearestPostcodes(params, function (error, postcodes) {
					if (error) return done(error);
					assert.equal(postcodes.length, limit);
					done();
				});
			});
		});
	});
});


