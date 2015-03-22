var path = require("path");
var app = require(path.join(__dirname, "../server"));
var request = require("supertest");
var assert = require("chai").assert;
var helper = require(path.join(__dirname, "/helper"));
var jsonResponseTypeRegex = /text\/javascript/;

describe("Utils with JSONP", function () {
	describe("Ping", function () {
		it ("should pong", function (done) {
			request(app)
				.get("/ping?callback=foo")
				.expect(200)
				.expect("Content-Type", /text\/javascript/)
				.end(function (error, response) {
					response.body = helper.jsonpResponseBody(response);
					if (error) throw error;
					assert.equal(response.body.result, "pong");
					done();
				});
		});
	});
});

describe("Postcodes routes with JSONP", function () {
	var testPostcode;

	before(function (done) {
		this.timeout(0);
		helper.clearPostcodeDb(function (error, result) {
			if (error) return done(error);
			helper.seedPostcodeDb(function (error, result) {
				if (error) return done(error);
				done();
			});
		})
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

	describe("GET /postcodes", function () {
		var uri, limit;
		it ("should return a list of matching postcode objects", function (done) {
			uri = encodeURI("/postcodes?q=" + testPostcode.replace(" ", "").slice(0, 2) + "&callback=foo");
			request(app)
			.get(uri)
			.expect("Content-Type", jsonResponseTypeRegex)
			.expect(200)
			.end(function (error, response) {
				response.body = helper.jsonpResponseBody(response);
				if (error) return done(error);
				assert.isArray(response.body.result);
				assert.equal(response.body.result.length, 10);
				response.body.result.forEach(function (postcode) {
					helper.isPostcodeObject(postcode);
				});
				done();
			});
		});
	});

	describe("GET /postcodes/:postcode", function () {
		it ("should return 200 if postcode found", function (done) {
			var path = ["/postcodes/", encodeURI(testPostcode), "?callback=foo"].join("");
			request(app)
			.get(path)
			.expect('Content-Type', jsonResponseTypeRegex)
			.expect(200)
			.end(function (error, response) {
				response.body = helper.jsonpResponseBody(response);
				if (error) return done(error);
				assert.equal(response.body.status, 200);
				assert.equal(response.body.result.postcode, testPostcode);
				helper.isPostcodeObject(response.body.result);
				done();
			});
		});
	});

	describe("/outcodes/:outcode", function (done) {
		it ("should return correct geolocation data for a given outcode", function (done) {
			var path = ["/outcodes/", encodeURI(testOutcode), "?callback=foo"].join("");
			request(app)
			.get(path)
			.expect("Content-Type", jsonResponseTypeRegex)
			.expect(200)
			.end(function (error, response) {
				response.body = helper.jsonpResponseBody(response);
				if (error) return done(error);
				assert.equal(response.body.status, 200);
				assert.equal(response.body.result.outcode, testOutcode);
				assert.property(response.body.result, "longitude");
				assert.property(response.body.result, "latitude");
				assert.property(response.body.result, "northings");
				assert.property(response.body.result, "eastings");
				done();
			});
		});
	});

	describe("GET /postcodes/:postcode/validate", function () {
		it ("should return true if postcode found", function (done) {
			var path = ["/postcodes/", encodeURI(testPostcode), "/validate", "?callback=foo"].join("");
			request(app)
			.get(path)
			.expect('Content-Type', jsonResponseTypeRegex)
			.expect(200)
			.end(function (error, response) {
				response.body = helper.jsonpResponseBody(response);
				if (error) return done(error);
				assert.equal(response.body.status, 200);
				assert.isTrue(response.body.result);
				done();
			});
		});
	});

	describe("GET /postcodes/:postcode/nearest", function () {
		it ("should return a list of nearby postcodes", function (done) {
			var uri = encodeURI("/postcodes/" + testPostcode + "/nearest");

			request(app)
			.get(uri)
			.query({
				callback: "foo"
			})
			.expect(200)
			.end(function (error, response) {
				response.body = helper.jsonpResponseBody(response);
				if (error) return done(error);
				assert.isArray(response.body.result);
				assert.isTrue(response.body.result.length > 0);
				response.body.result.forEach(function (postcode) {
					helper.isPostcodeObject(postcode);
				});
				done();
			});
		});
	});

	describe("GET /random/postcode", function () {
		it ("should return a random postcode", function (done) {
			var path = "/random/postcodes?callback=foo";
			request(app)
			.get(path)
			.expect('Content-Type', jsonResponseTypeRegex)
			.expect(200)
			.end(function (error, response) {
				response.body = helper.jsonpResponseBody(response);
				if (error) return done(error);
				assert.property(response.body.result, "postcode");
				helper.isPostcodeObject(response.body.result);
				done();
			});
		});
	});

	describe("GET /postcodes/:postcode/autocomplete", function () {
		var uri, limit;

		it ("should return a list of matching postcodes only", function (done) {
			uri = encodeURI("/postcodes/" + testPostcode.slice(0, 2) + "/autocomplete?callback=foo");

			request(app)
			.get(uri)
			.expect("Content-Type", jsonResponseTypeRegex)
			.expect(200)
			.end(function (error, response) {
				response.body = helper.jsonpResponseBody(response);
				if (error) return done(error);
				assert.isArray(response.body.result);
				assert.equal(response.body.result.length, 10);
				response.body.result.forEach(function (postcode) {
					assert.isString(postcode);
				});
				done();
			});
		});
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
			var uri = encodeURI("/postcodes/lon/" + loc.longitude + "/lat/" + loc.latitude + "?callback=foo");

			request(app)
			.get(uri)
			.expect("Content-Type", jsonResponseTypeRegex)
			.expect(200)
			.end(function (error, response) {
				response.body = helper.jsonpResponseBody(response);
				if (error) return done(error);
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
	});
});