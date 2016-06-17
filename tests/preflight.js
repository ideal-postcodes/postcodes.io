var path = require("path");
var app = require(path.join(__dirname, "../server"));
var request = require("supertest");
var assert = require("chai").assert;

describe("Preflight Requests (OPTIONS)", function () {
	it ("should allows preflight requests", function (done) {
		request(app)
			.options("/")
		  .expect(204)
		  .end(function(error, response){
		    if (error) return done(error);
		    assert.equal(response.headers['access-control-allow-origin'], "*");
		    assert.equal(response.headers['access-control-allow-methods'], "GET,POST,OPTIONS");
		    done();
		  });
	});
});