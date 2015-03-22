var path = require("path");
var app = require(path.join(__dirname, "../server"));
var request = require("supertest");
var assert = require("chai").assert;
var helper = require(path.join(__dirname + "/helper"));
var async = require("async");

describe("Postcodes routes", function () {
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

	describe("GET /postcodes/lon/:longitude/lat/latitude", function () {
		var loc;

		beforeEach(function (done) {
			helper.locationWithNearbyPostcodes(function (error, postcode) {
				if (error) return done(error);
				loc = postcode;
				done();
			});
		});

		it ("should return a list of nearby postcodes", function (done) {
			var uri = encodeURI("/postcodes/lon/" + loc.longitude + "/lat/" + loc.latitude);

			request(app)
			.get(uri)
			.expect("Content-Type", /json/)
			.expect(helper.allowsCORS)
			.expect(200)
			.end(function (error, response) {
				if (error) throw error;
				assert.isArray(response.body.result);
				assert.isTrue(response.body.result.length > 0);
				response.body.result.forEach(function (postcode) {
					helper.isPostcodeObject(postcode);
				});
				assert.isTrue(response.body.result.some(function (elem) {
					return elem.postcode === loc.postcode;
				}));
				done();
			});
		});
		it ("should be sensitive to distance query", function (done) {
			var uri = encodeURI("/postcodes/lon/" + loc.longitude + "/lat/" + loc.latitude);
			request(app)
			.get(uri)
			.expect(200)
			.end(function (error, firstResponse) {
				if (error) throw error;
				request(app)
				.get(uri)
				.query({
					radius: 2000
				})
				.expect(200)
				.end(function (error, secondResponse) {
					if (error) throw error;
					assert.isTrue(secondResponse.body.result.length >= firstResponse.body.result.length);
					done();
				});
			});
		});
		it ("should be sensitive to limit query", function (done) {
			var uri = encodeURI("/postcodes/lon/" + loc.longitude + "/lat/" + loc.latitude);
			request(app)
			.get(uri)
			.query({
				limit: 1
			})
			.expect(200)
			.end(function (error, response) {
				if (error) throw error;
				assert.equal(response.body.result.length, 1);
				done();
			});
		});
		it ("should throw a 400 error if invalid longitude", function (done) {
			var uri = encodeURI("/postcodes/lon/" + "BOGUS" + "/lat/" + loc.latitude);
			request(app)
			.get(uri)
			.expect(400)
			.end(function (error, response) {
				if (error) throw error;
				done();
			});
		});
		it ("should throw a 400 error if invalid latitude", function (done) {
			var uri = encodeURI("/postcodes/lon/" + loc.longitude + "/lat/" + "BOGUS");
			request(app)
			.get(uri)
			.expect(400)
			.end(function (error, response) {
				if (error) throw error;
				done();
			});
		});
		it ("should throw a 400 error if invalid limit", function (done) {
			var uri = encodeURI("/postcodes/lon/" + loc.longitude + "/lat/" + loc.latitude);
			request(app)
			.get(uri)
			.query({ 
				limit: "BOGUS" 
			})
			.expect(400)
			.end(function (error, response) {
				if (error) throw error;
				done();
			});
		});
		it ("should throw a 400 error if invalid distance", function (done) {
			var uri = encodeURI("/postcodes/lon/" + loc.longitude + "/lat/" + loc.latitude);
			request(app)
			.get(uri)
			.query({
				radius: "BOGUS"
			})
			.expect(400)
			.end(function (error, response) {
				if (error) throw error;
				done();
			});
		});
		it ("returns null if no postcodes nearby", function (done) {
			var uri = encodeURI("/postcodes/lon/0/lat/0");
			request(app)
			.get(uri)
			.expect(200)
			.end(function (error, response) {
				if (error) done(error);
				assert.isNull(response.body.result);
				done();
			});
		});
		it ("should respond to options", function (done) {
			var uri = encodeURI("/postcodes/lon/" + loc.longitude + "/lat/" + loc.latitude);
			request(app)
			.options(uri)
			.expect(204)
			.end(function (error, response) {
				if (error) done(error);
				helper.validCorsOptions(response);
				done();
			});
		});
	});
	
	describe("GET /postcodes?lon=:longitude&lat=:latitude", function () {
		var loc, uri;

		beforeEach(function (done) {
			uri = "/postcodes/";
			helper.locationWithNearbyPostcodes(function (error, postcode) {
				if (error) return done(error);
				loc = postcode;
				done();
			});
		});

		it ("returns a list of nearby postcodes", function (done) {
			request(app)
			.get(uri)
			.query({
				lon: loc.longitude,
				lat: loc.latitude
			})
			.expect("Content-Type", /json/)
			.expect(helper.allowsCORS)
			.expect(200)
			.end(function (error, response) {
				if (error) throw error;
				assert.isArray(response.body.result);
				assert.isTrue(response.body.result.length > 0);
				response.body.result.forEach(function (postcode) {
					helper.isPostcodeObject(postcode);
				});
				assert.isTrue(response.body.result.some(function (elem) {
					return elem.postcode === loc.postcode;
				}));
				done();
			});
		});
		it ("accepts full spelling of longitude and latitude", function (done) {
			request(app)
			.get(uri)
			.query({
				longitude: loc.longitude,
				latitude: loc.latitude
			})
			.expect("Content-Type", /json/)
			.expect(helper.allowsCORS)
			.expect(200)
			.end(function (error, response) {
				if (error) throw error;
				assert.isArray(response.body.result);
				assert.isTrue(response.body.result.length > 0);
				response.body.result.forEach(function (postcode) {
					helper.isPostcodeObject(postcode);
				});
				assert.isTrue(response.body.result.some(function (elem) {
					return elem.postcode === loc.postcode;
				}));
				done();
			});
		});
		it ("falls back to a postcode query if longitude is missing", function (done) {
			request(app)
			.get(uri)
			.query({
				latitude: loc.latitude
			})
			.expect("Content-Type", /json/)
			.expect(helper.allowsCORS)
			.expect(400)
			.end(function (error, response) {
				if (error) throw error;
				assert.equal(response.body.status, 400);
				done();
			});
		});
		it ("falls back to a postcode query if latitude is missing", function (done) {
			request(app)
			.get(uri)
			.query({
				longitude: loc.longitude
			})
			.expect("Content-Type", /json/)
			.expect(helper.allowsCORS)
			.expect(400)
			.end(function (error, response) {
				if (error) throw error;
				assert.equal(response.body.status, 400);
				done();
			});
		});
		it ("is sensitive to distance query", function (done) {
			request(app)
			.get(uri)
			.query({
				lon: loc.longitude,
				lat: loc.latitude
			})
			.expect(200)
			.end(function (error, firstResponse) {
				if (error) throw error;
				request(app)
				.get(uri)
				.query({
					lon: loc.longitude,
					lat: loc.latitude,
					radius: 2000
				})
				.expect(200)
				.end(function (error, secondResponse) {
					if (error) throw error;
					assert.isTrue(secondResponse.body.result.length >= firstResponse.body.result.length);
					done();
				});
			});
		});
		it ("is sensitive to limit query", function (done) {
			request(app)
			.get(uri)
			.query({
				lon: loc.longitude,
				lat: loc.latitude,
				limit: 1
			})
			.expect(200)
			.end(function (error, response) {
				if (error) throw error;
				assert.equal(response.body.result.length, 1);
				done();
			});
		});
		it ("returns a 400 error if invalid longitude", function (done) {
			request(app)
			.get(uri)
			.query({
				lon: "BOGUS",
				lat: loc.latitude
			})
			.expect(400)
			.end(function (error, response) {
				if (error) throw error;
				done();
			});
		});
		it ("returns a 400 error if invalid latitude", function (done) {
			request(app)
			.get(uri)
			.query({
				lon: loc.longitude,
				lat: "BOGUS"
			})
			.expect(400)
			.end(function (error, response) {
				if (error) throw error;
				done();
			});
		});
		it ("returns a 400 error if invalid limit", function (done) {
			request(app)
			.get(uri)
			.query({ 
				lon: loc.longitude,
				lat: loc.latitude,
				limit: "BOGUS" 
			})
			.expect(400)
			.end(function (error, response) {
				if (error) throw error;
				done();
			});
		});
		it ("returns a 400 error if invalid distance", function (done) {
			request(app)
			.get(uri)
			.query({
				lon: loc.longitude,
				lat: loc.latitude,
				radius: "BOGUS"
			})
			.expect(400)
			.end(function (error, response) {
				if (error) throw error;
				done();
			});
		});
		it ("returns null if no postcodes nearby", function (done) {
			var uri = encodeURI("/postcodes");
			request(app)
			.get(uri)
			.query({
				lat: 0,
				lon: 0
			})
			.expect(200)
			.end(function (error, response) {
				if (error) done(error);
				assert.isNull(response.body.result);
				done();
			});
		});
		it ("responds to options", function (done) {
			request(app)
			.options(uri)
			.expect(204)
			.end(function (error, response) {
				if (error) done(error);
				helper.validCorsOptions(response);
				done();
			});
		});
		describe("Wide Area Searches", function () {
			var longitude, latitude;
			beforeEach(function () {
				longitude = -2.12659411941741;
				latitude = 57.2465923827836;
			});
			it ("allows search over a larger area", function (done) {
				request(app)
					.get("/postcodes")
					.query({
						longitude: longitude,
						latitude: latitude,
						wideSearch: true
					})
					.expect("Content-Type", /json/)
					.expect(helper.allowsCORS)
					.expect(200)
					.end(function (error, response) {
						if (error) return done(error);
						assert.equal(response.body.result.length, 10);
						done();
					});
			});

			it ("does not allow limit to exceed 10", function (done) {
				request(app)
					.get("/postcodes")
					.query({
						longitude: longitude,
						latitude: latitude,
						limit: 100,
						wideSearch: true
					})
					.expect("Content-Type", /json/)
					.expect(helper.allowsCORS)
					.expect(200)
					.end(function (error, response) {
						if (error) return done(error);
						assert.equal(response.body.result.length, 10);
						done();
					});
			});

			it ("does allows limit to be below 10", function (done) {
				request(app)
					.get("/postcodes")
					.query({
						longitude: longitude,
						latitude: latitude,
						limit: 1,
						wideSearch: true
					})
					.expect("Content-Type", /json/)
					.expect(helper.allowsCORS)
					.expect(200)
					.end(function (error, response) {
						if (error) return done(error);
						assert.equal(response.body.result.length, 1);
						done();
					});
			});
		});
	});
});