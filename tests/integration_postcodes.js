var path = require("path"),
		app = require(path.join(__dirname, "../server")),
		request = require("supertest"),
		assert = require("chai").assert,
		helper = require(__dirname + "/helper");

describe("Postcodes routes", function () {
	var testPostcode;

	before(function (done) {
		helper.connectToDb();
		helper.seedPostcodeDb(function (error, result) {
			if (error) throw error;
			done();
		});
	});

	beforeEach(function () {
		testPostcode = helper.randomPostcode();
	});

	after(function (done) {
		helper.clearPostcodeDb(done);
	});

	describe("/:postcode", function () {
		it ("should return 200 if postcode found", function (done) {
			var path = ["/v1/postcodes/", encodeURI(testPostcode)].join("");
			request(app)
			.get(path)
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (error, response) {
				if (error) throw error;
				assert.equal(response.body.status, 200);
				assert.equal(response.body.result.postcode, testPostcode);
				assert.notProperty(response.body.result, "id");
				done();
			});
		});
		it ("should return 404 if not found", function (done) {
			testPostcode = "ID11QE";
			var path = ["/v1/postcodes/", encodeURI(testPostcode)].join("");
			request(app)
			.get(path)
			.expect('Content-Type', /json/)
			.expect(404)
			.end(function (error, response) {
				if (error) throw error;
				assert.equal(response.body.status, 404);
				assert.property(response.body, "error");
				done();
			});
		});
		describe("bulk lookups", function () {
			var	bulkLength = 10,
					testPostcodes;
			
			beforeEach(function () {
				testPostcodes = [];
				for (var i = 0; i < bulkLength; i++) {
					testPostcodes.push(helper.randomPostcode());
				}
			});

			it ("should return addresses for postcodes", function (done) {
				request(app)
				.post("/v1/postcodes")
				.send(testPostcodes)
				.expect('Content-Type', /json/)
				.expect(200)
				.end(function (error, response) {
					if (error) throw error;
					assert.isArray(response.body.result);
					assert.equal(response.body.result.length, bulkLength);
					response.body.result.forEach(function (lookup) {
						assert.property(lookup, "query");
						assert.property(lookup, "result");
						assert.property(lookup.result, "postcode");
					});
					done();
				});
			});
			it ("should return a null if postcode not found", function (done) {
				testPostcodes.push("B0GUS");
				request(app)
				.post("/v1/postcodes")
				.send(testPostcodes)
				.expect('Content-Type', /json/)
				.expect(200)
				.end(function (error, response) {
					if (error) throw error;
					assert.equal(response.body.result.length, bulkLength + 1);
					var hasNull = response.body.result.some(function (lookup) {
						return lookup.result === null;
					});
					assert.isTrue(hasNull);
					done();
				});
			});
			it ("should refuse requests if lookups number over 100", function (done) {
				testPostcodes = [];
				for (var i = 0; i < 101; i++) {
					testPostcodes.push("bogus");
				}
				request(app)
				.post("/v1/postcodes")
				.send(testPostcodes)
				.expect('Content-Type', /json/)
				.expect(400)
				.end(function (error, response) {
					if (error) throw error;
					done();
				});
			});
			it ("should return a 400 error if array not submitted", function (done) {
				request(app)
				.post("/v1/postcodes")
				.send({"wrong" : "dataType"})
				.expect('Content-Type', /json/)
				.expect(400)
				.end(function (error, response) {
					if (error) throw error;
					done();
				});
			});
		});
	});
	describe("/:postcode/valid", function () {
		it ("should return true if postcode found", function (done) {
			var path = ["/v1/postcodes/", encodeURI(testPostcode), "/valid"].join("");
			request(app)
			.get(path)
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (error, response) {
				if (error) throw error;
				assert.equal(response.body.status, 200);
				assert.isTrue(response.body.result);
				done();
			});
		});
		it ("should return false if postcode not found", function (done) {
			testPostcode = "ID11QE";
			var path = ["/v1/postcodes/", encodeURI(testPostcode), "/valid"].join("");
			request(app)
			.get(path)
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (error, response) {
				if (error) throw error;
				assert.equal(response.body.status, 200);
				assert.isFalse(response.body.result);
				done();
			});
		});
	});
	describe("/random/postcode", function () {
		it ("should return a random postcode", function (done) {
			var path = "/v1/random/postcodes";
			request(app)
			.get(path)
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (error, response) {
				if (error) throw error;
				assert.property(response.body.result, "postcode");
				assert.notProperty(response.body.result, "id");
				done();
			});
		});
	});
});