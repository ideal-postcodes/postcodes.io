var	path = require("path"),
		async = require("async"),
		assert = require("chai").assert,
		helper = require(__dirname + "/helper");
		
var Postcode = helper.Postcode;

describe("Postcode Model", function () {
	var testPostcode;

	before(function (done) {
		this.timeout(0);
		helper.seedPostcodeDb(function (error, result) {
			if (error) throw error;
			done();
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
				if (error) throw error;
				assert.equal(result.postcode, testPostcode);
				helper.isRawPostcodeObject(result);
				done();
			});
		});
		it ("should be insensitive to space", function (done) {
			Postcode.find(testPostcode.replace(/\s/, ""), function (error, result) {
				if (error) throw error;
				assert.equal(result.postcode, testPostcode);
				done();
			});
		});
		it ("should return null if postcode does not exist", function (done) {
			Postcode.find("ID11QD", function (error, result) {
				if (error) throw error;
				assert.isNull(result);
				done();
			});
		});
	});

	describe("#search", function () {
		it ("should return a list of candidate postcodes for given search term", function (done) {
			testPostcode = testPostcode.slice(0, 2);
			Postcode.search(testPostcode, function (error, result) {
				if (error) throw error;
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
				if (error) throw error;
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
				if (error) throw error;
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
				if (error) throw error;
				helper.isRawPostcodeObject(postcode);
				done();
			});
		});
	});

	describe("#findOutcode", function () {
		it ("should return the outcode with the right attributes", function (done) {
			Postcode.findOutcode(testOutcode, function (error, result) {
				if (error) throw error;
				assert.equal(result.outcode, testOutcode);
				assert.property(result, "northings");
				assert.property(result, "eastings");
				assert.property(result, "longitude");
				assert.property(result, "latitude");
				done();
			});
		});
		it ("should return null if no matching outcode", function (done) {
			Postcode.findOutcode("BOGUSOUTCODE", function (error, result) {
				if (error) throw error;
				assert.equal(result, null);
				done();
			});
		});
		it ("should return null for a plausible but non-existent postcode", function (done) {
			Postcode.findOutcode("EJ12", function (error, result) {
				if (error) throw error;
				assert.equal(result, null);
				done();
			});
		});
		it ("should be insensitive to space", function (done) {
			Postcode.findOutcode(testOutcode + "    ", function (error, result) {
				if (error) throw error;
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
				if (error) throw error;
				assert.equal(result.outcode, testOutcode);
				assert.property(result, "northings");
				assert.property(result, "eastings");
				assert.property(result, "longitude");
				assert.property(result, "latitude");
				done();
			});
		});
	})

	describe("#nearestPostcodes", function () {
		var randomPostcode;

		beforeEach(function (done) {
			helper.lookupRandomPostcode(function (postcode) {
				randomPostcode = postcode;
				done();
			});
		});

		it ("should return a list of nearby postcodes", function (done) {
			var params = {
				longitude: randomPostcode.longitude,
				latitude: randomPostcode.latitude
			}
			Postcode.nearestPostcodes(params, function (error, postcodes) {
				if (error) throw error;
				assert.isArray(postcodes);
				postcodes.forEach(function (postcode) {
					helper.isRawPostcodeObject(postcode);
				});
				done();
			});
		});
		it ("should be sensitive to limit", function (done) {
			var params = {
				longitude: randomPostcode.longitude,
				latitude: randomPostcode.latitude,
				limit: 1
			}
			Postcode.nearestPostcodes(params, function (error, postcodes) {
				if (error) throw error;
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
					longitude: randomPostcode.longitude,
					latitude: randomPostcode.latitude,
				},
				farAway = {
					longitude: randomPostcode.longitude,
					latitude: randomPostcode.latitude,
					radius: 1000
				};

			Postcode.nearestPostcodes(nearby, function (error, postcodes) {
				if (error) throw error;
				Postcode.nearestPostcodes(farAway, function (error, farawayPostcodes) {
					if (error) throw error;
					assert.isTrue(farawayPostcodes.length >= postcodes.length);
					done();
				});
			});
		});
		it ("should default limit to 10 if invalid", function (done) {
			var params = {
				longitude: randomPostcode.longitude,
				latitude: randomPostcode.latitude,
				limit: "Bogus"
			};
			Postcode.nearestPostcodes(params, function (error, postcodes) {
				if (error) throw error;
				assert.isTrue(postcodes.length <= 10);
				done();
			});
		});
		it ("should default radius to 100 if invalid", function (done) {
			var nearby = {
					longitude: randomPostcode.longitude,
					latitude: randomPostcode.latitude,
					radius: "BOGUS"
				},
				farAway = {
					longitude: randomPostcode.longitude,
					latitude: randomPostcode.latitude,
					radius: 1000
				};

			Postcode.nearestPostcodes(nearby, function (error, postcodes) {
				if (error) throw error;
				Postcode.nearestPostcodes(farAway, function (error, farawayPostcodes) {
					if (error) throw error;
					assert.isTrue(farawayPostcodes.length >= postcodes.length);
					done();
				});
			});
		});
		it ("should raise an error if invalid longitude", function (done) {
			var params = {
				longitude: "Bogus",
				latitude: randomPostcode.latitude,
			};
			Postcode.nearestPostcodes(params, function (error, postcodes) {
				assert.isNotNull(error);
				assert.match(error.message, /invalid longitude/i);
				done();
			});
		});
		it ("should raise an error if invalid latitude", function (done) {
			var params = {
				longitude: randomPostcode.longitude,
				latitude: "Bogus",
			};
			Postcode.nearestPostcodes(params, function (error, postcodes) {
				assert.isNotNull(error);
				assert.match(error.message, /invalid latitude/i);
				done();
			});
		});
	});
});


