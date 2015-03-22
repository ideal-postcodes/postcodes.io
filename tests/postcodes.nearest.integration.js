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

	describe("GET /postcodes/:postcode/nearest", function () {

		it ("should return a list of nearby postcodes", function (done) {
			var uri = encodeURI("/postcodes/" + testPostcode + "/nearest");

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
				done();
			});
		});
		it ("should be sensitive to distance query", function (done) {
			var uri = encodeURI("/postcodes/" + testPostcode + "/nearest");

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
			var uri = encodeURI("/postcodes/" + testPostcode + "/nearest");

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
		
		it ("should throw a 400 error if invalid limit", function (done) {
			var uri = encodeURI("/postcodes/" + testPostcode + "/nearest");

			request(app)
			.get(uri)
			.query({
				limit: "bogus"
			})
			.expect(400)
			.end(function (error, response) {
				if (error) throw error;
				assert.equal(response.body.error, "Invalid result limit submitted");
				done();
			});
		});

		it ("should throw a 400 error if invalid distance", function (done) {
			var uri = encodeURI("/postcodes/" + testPostcode + "/nearest");

			request(app)
			.get(uri)
			.query({
				radius: "bogus"
			})
			.expect(400)
			.end(function (error, response) {
				if (error) throw error;
				assert.equal(response.body.error, "Invalid lookup radius submitted")
				done();
			});
		});

		it ("should respond to options", function (done) {
			var uri = encodeURI("/postcodes/" + testPostcode + "/nearest");

			request(app)
			.options(uri)
			.expect(204)
			.end(function (error, response) {
				if (error) done(error);
				helper.validCorsOptions(response);
				done();
			});
		});

		it ("should return 404 if postcode not found", function (done) {
			var testPostcode = "ID11QE";
			var path = ["/postcodes/", encodeURI(testPostcode), "/nearest"].join("");
			request(app)
				.get(path)
				.expect("Content-Type", /json/)
				.expect(404)
				.end(function (error, response) {
					if (error) return done(error);
					assert.equal(response.body.error, "Postcode not found");
					done();
				});
		});
	});
});