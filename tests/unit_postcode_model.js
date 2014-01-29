var assert = require("chai").assert,
		path = require("path"),
		helper = require(__dirname + "/helper"),
		Postcode = helper.Postcode;

describe("Postcode Model", function () {
	before(function (done) {
		helper.seedPostcodeDb(function (error, result) {
			if (error) throw error;
			done();
		});
	});

	after(function (done) {
		helper.clearPostcodeDb(done);
	});

	describe("#find", function () {
		var testPostcode;

		beforeEach(function () {
			testPostcode = helper.randomPostcode();
		})

		it ("should return postcode with the right attributes", function (done) {
			Postcode.find(testPostcode, function (error, result) {
				if (error) throw error;
				assert.equal(result.postcode, testPostcode);
				assert.property(result, "quality");
				assert.property(result, "eastings");
				assert.property(result, "northings");
				assert.property(result, "country");
				assert.property(result, "nhs_regional_ha");
				assert.property(result, "nhs_ha");
				assert.property(result, "admin_county");
				assert.property(result, "admin_district");
				assert.property(result, "admin_ward");
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

	describe("#random", function () {
		it ("should return a random postcode", function (done) {
			Postcode.random(function (error, randomPostcode) {
				if (error) throw error;
				assert.property(randomPostcode, "postcode");
				assert.property(randomPostcode, "quality");
				assert.property(randomPostcode, "eastings");
				assert.property(randomPostcode, "northings");
				assert.property(randomPostcode, "country");
				assert.property(randomPostcode, "nhs_regional_ha");
				assert.property(randomPostcode, "nhs_ha");
				assert.property(randomPostcode, "admin_county");
				assert.property(randomPostcode, "admin_district");
				assert.property(randomPostcode, "admin_ward");
				done();
			});
		});
	});
});