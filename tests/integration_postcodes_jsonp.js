var path = require("path"),
		app = require(path.join(__dirname, "../server")),
		request = require("supertest"),
		assert = require("chai").assert,
		helper = require(__dirname + "/helper"),
		jsonResponseTypeRegex = /text\/javascript/;

describe("Postcodes routes with JSONP", function () {
	var testPostcode;

	before(function (done) {
		this.timeout(0);
		helper.connectToDb();
		helper.clearPostcodeDb(function (error, result) {
			if (error) throw error;
			helper.seedPostcodeDb(function (error, result) {
				if (error) throw error;
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
				if (error) throw error;
				assert.isArray(response.body.result);
				assert.equal(response.body.result.length, 10);
				response.body.result.forEach(function (postcode) {
					helper.isPostcodeObject(postcode);
				});
				done();
			});
		});
		it ("should be insensitive to case", function (done) {
			uri = encodeURI("/postcodes?q=" + testPostcode.slice(0, 2).toLowerCase() + "&callback=foo");
			request(app)
			.get(uri)
			.expect("Content-Type", jsonResponseTypeRegex)
			.expect(200)
			.end(function (error, response) {
				response.body = helper.jsonpResponseBody(response);
				if (error) throw error;
				assert.isArray(response.body.result);
				assert.equal(response.body.result.length, 10);
				response.body.result.forEach(function (postcode) {
					helper.isPostcodeObject(postcode);
				});
				done();
			});
		});
		it ("should be insensitive to space", function (done) {
			uri = encodeURI("/postcodes?q=" + testPostcode.slice(0, 2).split("").join(" ") + "&callback=foo");
			request(app)
			.get(uri)
			.expect("Content-Type", jsonResponseTypeRegex)
			.expect(200)
			.end(function (error, response) {
				response.body = helper.jsonpResponseBody(response);
				if (error) throw error;
				assert.isArray(response.body.result);
				assert.equal(response.body.result.length, 10);
				response.body.result.forEach(function (postcode) {
					helper.isPostcodeObject(postcode);
				});
				done();
			});
		});
		it ("should be sensitive to limit", function (done) {
			limit = 11;
			uri = encodeURI("/postcodes?q=" + testPostcode.slice(0, 2).split("").join(" ") + "&limit=" + limit + "&callback=foo");
			request(app)
			.get(uri)
			.expect("Content-Type", jsonResponseTypeRegex)
			.expect(200)
			.end(function (error, response) {
				response.body = helper.jsonpResponseBody(response);
				if (error) throw error;
				assert.isArray(response.body.result);
				assert.equal(response.body.result.length, 11);
				response.body.result.forEach(function (postcode) {
					helper.isPostcodeObject(postcode);
				});
				done();
			});
		});
		it ("should max out limit at 100", function (done) {
			limit = 101;
			uri = encodeURI("/postcodes?q=" + testPostcode.slice(0, 2).split("").join(" ") + "&limit=" + limit + "&callback=foo");
			request(app)
			.get(uri)
			.expect("Content-Type", jsonResponseTypeRegex)
			.expect(200)
			.end(function (error, response) {
				response.body = helper.jsonpResponseBody(response);
				if (error) throw error;
				assert.isArray(response.body.result);
				assert.equal(response.body.result.length, 100);
				response.body.result.forEach(function (postcode) {
					helper.isPostcodeObject(postcode);
				});
				done();
			});
		});
		it ("should set limit to 10 if invalid", function (done) {
			limit = "BOGUS";
			uri = encodeURI("/postcodes?q=" + testPostcode.slice(0, 2).split("").join(" ") + "&limit=" + limit + "&callback=foo");
			request(app)
			.get(uri)
			.expect("Content-Type", jsonResponseTypeRegex)
			.expect(200)
			.end(function (error, response) {
				response.body = helper.jsonpResponseBody(response);
				if (error) throw error;
				assert.isArray(response.body.result);
				assert.equal(response.body.result.length, 10);
				response.body.result.forEach(function (postcode) {
					helper.isPostcodeObject(postcode);
				});
				done();
			});
		});
		it ("should return 400 if no postcode submitted", function (done) {
			uri = encodeURI("/postcodes?callback=foo&q=");
			request(app)
			.get(uri)
			.expect("Content-Type", jsonResponseTypeRegex)
			.expect(200)
			.end(function (error, response) {
				response.body = helper.jsonpResponseBody(response);
				if (error) throw error;
				assert.equal(response.body.status, 400);
				done();
			});
		});
	});

	describe("/:postcode", function () {
		it ("should return 200 if postcode found", function (done) {
			var path = ["/postcodes/", encodeURI(testPostcode), "?callback=foo"].join("");
			request(app)
			.get(path)
			.expect('Content-Type', jsonResponseTypeRegex)
			.expect(200)
			.end(function (error, response) {
				response.body = helper.jsonpResponseBody(response);
				if (error) throw error;
				assert.equal(response.body.status, 200);
				assert.equal(response.body.result.postcode, testPostcode);
				helper.isPostcodeObject(response.body.result);
				done();
			});
		});
		it ("should return 404 if not found", function (done) {
			testPostcode = "ID11QE";
			var path = ["/postcodes/", encodeURI(testPostcode), "?callback=foo"].join("");
			request(app)
			.get(path)
			.expect('Content-Type', jsonResponseTypeRegex)
			.expect(200)
			.end(function (error, response) {
				response.body = helper.jsonpResponseBody(response);
				if (error) throw error;
				assert.equal(response.body.status, 404);
				assert.property(response.body, "error");
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
				if (error) throw error;
				assert.equal(response.body.status, 200);
				assert.equal(response.body.result.outcode, testOutcode);
				assert.property(response.body.result, "longitude");
				assert.property(response.body.result, "latitude");
				assert.property(response.body.result, "northings");
				assert.property(response.body.result, "eastings");
				done();
			});
		});
		it ("should be case insensitive", function (done) {
			var path = ["/outcodes/", encodeURI(testOutcode.toLowerCase()), "?callback=foo"].join("");
			request(app)
			.get(path)
			.expect("Content-Type", jsonResponseTypeRegex)
			.expect(200)
			.end(function (error, response) {
				response.body = helper.jsonpResponseBody(response);
				if (error) throw error;
				assert.equal(response.body.status, 200);
				assert.equal(response.body.result.outcode, testOutcode);
				assert.property(response.body.result, "longitude");
				assert.property(response.body.result, "latitude");
				assert.property(response.body.result, "northings");
				assert.property(response.body.result, "eastings");
				done();
			});
		});
		it ("should be space insensitive", function (done) {
			var path = ["/outcodes/", encodeURI(testOutcode+"   "), "?callback=foo"].join("");
			request(app)
			.get(path)
			.expect("Content-Type", jsonResponseTypeRegex)
			.expect(200)
			.end(function (error, response) {
				response.body = helper.jsonpResponseBody(response);
				if (error) throw error;
				assert.equal(response.body.status, 200);
				assert.equal(response.body.result.outcode, testOutcode);
				assert.property(response.body.result, "longitude");
				assert.property(response.body.result, "latitude");
				assert.property(response.body.result, "northings");
				assert.property(response.body.result, "eastings");
				done();
			});
		});
		it ("should return 404 for an outcode which does not exist", function (done) {
			var path = ["/outcodes/", encodeURI("DEFINITELYBOGUS"), "?callback=foo"].join("");
			request(app)
			.get(path)
			.expect("Content-Type", jsonResponseTypeRegex)
			.expect(200)
			.end(function (error, response) {
				response.body = helper.jsonpResponseBody(response);
				if (error) throw error;
				assert.equal(response.body.status, 404);
				assert.isNull(response.body.result);
				done();
			});
		});
	});

	describe("/:postcode/validate", function () {
		it ("should return true if postcode found", function (done) {
			var path = ["/postcodes/", encodeURI(testPostcode), "/validate", "?callback=foo"].join("");
			request(app)
			.get(path)
			.expect('Content-Type', jsonResponseTypeRegex)
			.expect(200)
			.end(function (error, response) {
				response.body = helper.jsonpResponseBody(response);
				if (error) throw error;
				assert.equal(response.body.status, 200);
				assert.isTrue(response.body.result);
				done();
			});
		});
		it ("should return false if postcode not found", function (done) {
			testPostcode = "ID11QE";
			var path = ["/postcodes/", encodeURI(testPostcode), "/validate", "?callback=foo"].join("");
			request(app)
			.get(path)
			.expect('Content-Type', jsonResponseTypeRegex)
			.expect(200)
			.end(function (error, response) {
				response.body = helper.jsonpResponseBody(response);
				if (error) throw error;
				assert.equal(response.body.status, 200);
				assert.isFalse(response.body.result);
				done();
			});
		});
	});

	describe("/random/postcode", function () {
		it ("should return a random postcode", function (done) {
			var path = "/random/postcodes?callback=foo";
			request(app)
			.get(path)
			.expect('Content-Type', jsonResponseTypeRegex)
			.expect(200)
			.end(function (error, response) {
				response.body = helper.jsonpResponseBody(response);
				if (error) throw error;
				assert.property(response.body.result, "postcode");
				helper.isPostcodeObject(response.body.result);
				done();
			});
		});
	});

	describe("/:postcode/autocomplete", function () {
		var uri, limit;

		it ("should return a list of matching postcodes only", function (done) {
			uri = encodeURI("/postcodes/" + testPostcode.slice(0, 2) + "/autocomplete?callback=foo");

			request(app)
			.get(uri)
			.expect("Content-Type", jsonResponseTypeRegex)
			.expect(200)
			.end(function (error, response) {
				response.body = helper.jsonpResponseBody(response);
				if (error) throw error;
				assert.isArray(response.body.result);
				assert.equal(response.body.result.length, 10);
				response.body.result.forEach(function (postcode) {
					assert.isString(postcode);
				});
				done();
			});
		});
		it ("should be insensitive to case", function (done) {
			uri = encodeURI("/postcodes/" + testPostcode.slice(0, 2).toLowerCase() + "/autocomplete?callback=foo");

			request(app)
			.get(uri)
			.expect("Content-Type", jsonResponseTypeRegex)
			.expect(200)
			.end(function (error, response) {
				response.body = helper.jsonpResponseBody(response);
				if (error) throw error;
				assert.isArray(response.body.result);
				assert.equal(response.body.result.length, 10);
				response.body.result.forEach(function (postcode) {
					assert.isString(postcode);
				});
				done();
			});
		});
		it ("should be insensitive to space", function (done) {
			uri = encodeURI("/postcodes/" + testPostcode.slice(0, 2).split("").join(" ") + "/autocomplete?callback=foo");

			request(app)
			.get(uri)
			.expect("Content-Type", jsonResponseTypeRegex)
			.expect(200)
			.end(function (error, response) {
				response.body = helper.jsonpResponseBody(response);
				if (error) throw error;
				assert.isArray(response.body.result);
				assert.equal(response.body.result.length, 10);
				response.body.result.forEach(function (postcode) {
					assert.isString(postcode);
				});
				done();
			});
		});
		it("should be sensitive to limit", function (done) {
			limit = 11;
			uri = encodeURI("/postcodes/" + testPostcode.slice(0, 2).split("").join(" ") + "/autocomplete" + "?limit=" + limit + "&callback=foo");

			request(app)
			.get(uri)
			.expect("Content-Type", jsonResponseTypeRegex)
			.expect(200)
			.end(function (error, response) {
				response.body = helper.jsonpResponseBody(response);
				if (error) throw error;
				assert.isArray(response.body.result);
				assert.equal(response.body.result.length, limit);
				response.body.result.forEach(function (postcode) {
					assert.isString(postcode);
				});
				done();
			});
		});
		it("should max limit out at 100", function (done) {
			limit = 101;
			uri = encodeURI("/postcodes/" + testPostcode.slice(0, 2).split("").join(" ") + "/autocomplete" + "?limit=" + limit + "&callback=foo");

			request(app)
			.get(uri)
			.expect("Content-Type", jsonResponseTypeRegex)
			.expect(200)
			.end(function (error, response) {
				response.body = helper.jsonpResponseBody(response);
				if (error) throw error;
				assert.isArray(response.body.result);
				assert.equal(response.body.result.length, 100);
				response.body.result.forEach(function (postcode) {
					assert.isString(postcode);
				});
				done();
			});
		});
		it("should set limit to 10 if invalid", function (done) {
			limit = "BOGUS";
			uri = encodeURI("/postcodes/" + testPostcode.slice(0, 2).split("").join(" ") + "/autocomplete" + "?limit=" + limit + "&callback=foo");

			request(app)
			.get(uri)
			.expect("Content-Type", jsonResponseTypeRegex)
			.expect(200)
			.end(function (error, response) {
				response.body = helper.jsonpResponseBody(response);
				if (error) throw error;
				assert.isArray(response.body.result);
				assert.equal(response.body.result.length, 10);
				response.body.result.forEach(function (postcode) {
					assert.isString(postcode);
				});
				done();
			});
		});
	});

	describe("#/lon/:longitude/lat/latitude", function () {
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
			var uri = encodeURI("/postcodes/lon/" + loc.longitude + "/lat/" + loc.latitude + "?callback=foo");

			request(app)
			.get(uri)
			.expect(200)
			.end(function (error, firstResponse) {
				firstResponse.body = helper.jsonpResponseBody(firstResponse);
				if (error) throw error;
				request(app)
				.get(uri + encodeURI("?radius=2000"))
				.expect(200)
				.end(function (error, secondResponse) {
					secondResponse.body = helper.jsonpResponseBody(secondResponse);
					if (error) throw error;
					assert.isTrue(secondResponse.body.result.length >= firstResponse.body.result.length);
					done();
				});
			});
		});
		it ("should be sensitive to limit query", function (done) {
			var uri = encodeURI("/postcodes/lon/" + loc.longitude + "/lat/" + loc.latitude + "?limit=1" + "&callback=foo");
			request(app)
			.get(uri)
			.expect(200)
			.end(function (error, response) {
				response.body = helper.jsonpResponseBody(response);
				if (error) throw error;
				assert.equal(response.body.result.length, 1);
				done();
			});
		});
		it ("should throw a 400 error if invalid longitude", function (done) {
			var uri = encodeURI("/postcodes/lon/" + "BOGUS" + "/lat/" + loc.latitude + "?limit=1" + "&callback=foo");
			request(app)
			.get(uri)
			.expect(200)
			.end(function (error, response) {
				response.body = helper.jsonpResponseBody(response);
				if (error) throw error;
				done();
			});
		});
		it ("should throw a 400 error if invalid latitude", function (done) {
			var uri = encodeURI("/postcodes/lon/" + loc.longitude + "/lat/" + "BOGUS" + "?callback=foo");
			request(app)
			.get(uri)
			.expect(200)
			.end(function (error, response) {
				response.body = helper.jsonpResponseBody(response);
				if (error) throw error;
				done();
			});
		});
		it ("should throw a 400 error if invalid limit", function (done) {
			var uri = encodeURI("/postcodes/lon/" + loc.longitude + "/lat/" + loc.latitude + "?limit=bogus" + "&callback=foo");
			request(app)
			.get(uri)
			.expect(200)
			.end(function (error, response) {
				response.body = helper.jsonpResponseBody(response);
				if (error) throw error;
				done();
			});
		});
		it ("should throw a 400 error if invalid distance", function (done) {
			var uri = encodeURI("/postcodes/lon/" + loc.longitude + "/lat/" + loc.latitude + "?radius=bogus" + "&callback=foo");
			request(app)
			.get(uri)
			.expect(200)
			.end(function (error, response) {
				response.body = helper.jsonpResponseBody(response);
				if (error) throw error;
				done();
			});
		});
	});
});