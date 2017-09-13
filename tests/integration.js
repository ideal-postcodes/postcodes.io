"use strict";

const app = require("../server");
const request = require("supertest");
const assert = require("chai").assert;

describe("Pages routes", () => {
	describe("/", () => {
		it ("should return 200", done => {
			request(app)
				.get("/")
				.expect('Content-Type', /html/)
				.expect(200)
				.end(done);
		});
	});

	describe("/docs", () => {
		it ("should return 200", done => {
			request(app)
				.get("/docs")
				.expect('Content-Type', /html/)
				.expect(200)
				.end(done);
		});
	});

	describe("/about", () => {
		it ("should return 200", done => {
			request(app)
				.get("/about")
				.expect("Content-Type", /html/)
				.expect(200)
				.end(done);
		});
	});

	describe("/explore", () => {
		it ("should return 200", done => {
			request(app)
				.get("/explore")
				.expect("Content-Type", /html/)
				.expect(200)
				.end(done);
		});
	});
});

describe("Errors", () => {
	describe("404", () => {
		it ("should return a 404 if page does not exist", done => {
			request(app)
				.get("/surely/this/pagewouldn/ot/exist")
				.expect('Content-Type', /json/)
				.expect(404)
				.end(done);
		});
	});
});

describe("Misc", () => {
	it ("should return a favicon", done => {
		request(app)
			.get("/favicon.ico")
			.expect(200)
			.end(done);
	});
});

describe("Utils", () => {
	describe("Ping", () => {
		it ("should pong", done => {
			request(app)
				.get("/ping")
				.expect(200)
				.expect("Content-Type", /json/)
				.end((error, response) => {
					if (error) return done(error);
					assert.equal(response.body.result, "pong");
					done();
				});
		});
	});
});
