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
		it ("should provide suggestion if postcode not found");
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