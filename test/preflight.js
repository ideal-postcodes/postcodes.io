"use strict";

const path = require("path");
const app = require(path.join(__dirname, "../server"));
const request = require("supertest");
const assert = require("chai").assert;

describe("Preflight Requests (OPTIONS)", () => {
	it ("should allows preflight requests", done => {
		request(app)
			.options("/")
		  .expect(204)
		  .end((error, response) => {
		    if (error) return done(error);
		    assert.equal(response.headers['access-control-allow-origin'], "*");
		    assert.equal(response.headers['access-control-allow-methods'], "GET,POST,OPTIONS");
		    done();
		  });
	});
});