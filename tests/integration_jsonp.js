var path = require("path"),
		app = require(path.join(__dirname, "../server")),
		request = require("supertest"),
		helper = require(path.join(__dirname, "helper")),
		assert = require("chai").assert;

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