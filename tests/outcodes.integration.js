var path = require("path");
var app = require(path.join(__dirname, "../server"));
var request = require("supertest");
var assert = require("chai").assert;
var helper = require(path.join(__dirname + "/helper"));

describe("Postcodes routes", function () {
	describe("GET /outcodes/:outcode", function (done) {
		it ("should return correct geolocation data for a given outcode", function (done) {
			var path = ["/outcodes/", encodeURI(testOutcode)].join("");
			request(app)
			.get(path)
			.expect("Content-Type", /json/)
			.expect(helper.allowsCORS)
			.expect(200)
			.end(function (error, response) {
				if (error) throw error;
				assert.equal(response.body.status, 200);
				assert.equal(response.body.result.outcode, testOutcode);
				helper.testOutcode(response.body.result);
				done();
			});
		});
		it ("should be case insensitive", function (done) {
			var path = ["/outcodes/", encodeURI(testOutcode.toLowerCase())].join("");
			request(app)
			.get(path)
			.expect("Content-Type", /json/)
			.expect(helper.allowsCORS)
			.expect(200)
			.end(function (error, response) {
				if (error) throw error;
				assert.equal(response.body.status, 200);
				assert.equal(response.body.result.outcode, testOutcode);
				helper.testOutcode(response.body.result);
				done();
			});
		});
		it ("should be space insensitive", function (done) {
			var path = ["/outcodes/", encodeURI(testOutcode+"   ")].join("");
			request(app)
			.get(path)
			.expect("Content-Type", /json/)
			.expect(helper.allowsCORS)
			.expect(200)
			.end(function (error, response) {
				if (error) throw error;
				assert.equal(response.body.status, 200);
				assert.equal(response.body.result.outcode, testOutcode);
				helper.testOutcode(response.body.result);
				done();
			});
		});
		it ("should return 404 for an outcode which does not exist", function (done) {
			var path = ["/outcodes/", encodeURI("DEFINITELYBOGUS")].join("");
			request(app)
			.get(path)
			.expect("Content-Type", /json/)
			.expect(helper.allowsCORS)
			.expect(404)
			.end(function (error, response) {
				if (error) throw error;
				assert.equal(response.body.status, 404);
				assert.isNull(response.body.result);
				done();
			});
		});
		it ("should respond to options", function (done) {
			var path = ["/outcodes/", encodeURI(testOutcode)].join("");
			request(app)
			.options(path)
			.expect(204)
			.end(function (error, response) {
				if (error) done(error);
				helper.validCorsOptions(response);
				done();
			});
		});
	});
});