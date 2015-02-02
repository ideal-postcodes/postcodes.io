var path = require("path"),
		app = require(path.join(__dirname, "../server")),
		request = require("supertest"),
		assert = require("chai").assert,
		helper = require(__dirname + "/helper")
		async = require("async");

describe("Postcodes routes", function () {
	var testPostcode;

	before(function (done) {
		this.timeout(0);
		helper.connectToDb();
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
});