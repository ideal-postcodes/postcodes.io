var path = require("path"),
		app = require(path.join(__dirname, "../server")),
		request = require("supertest"),
		assert = require("chai").assert;

describe("Pages routes", function () {
	describe("/", function () {
		it ("should return 200", function (done) {
			request(app)
				.get("/")
			  .expect('Content-Type', /html/)
			  .expect(200)
			  .end(function(error, response){
			    if (error) return done(error);
			    done();
			  });
		});
	});

	describe("/docs", function () {
		it ("should return 200", function (done) {
			request(app)
				.get("/docs")
			  .expect('Content-Type', /html/)
			  .expect(200)
			  .end(function(error, response){
			    if (error) return done(error);
			    done();
			  });
		});
	});

	describe("/about", function () {
		it ("should return 200", function (done) {
			request(app)
				.get("/about")
				.expect("Content-Type", /html/)
				.expect(200)
				.end(function(error, res) {
					if (error) return done(error);
					done();
				});
		});
	});

	describe("/explore", function () {
		it ("should return 200", function (done) {
			request(app)
				.get("/explore")
				.expect("Content-Type", /html/)
				.expect(200)
				.end(function(error, res) {
					if (error) return done(error);
					done();
				});
		});
	});
});

describe("Errors", function () {
	describe("404", function () {
		it ("should return a 404 if page does not exist", function (done) {
			request(app)
				.get("/surely/this/pagewouldn/ot/exist")
				.expect('Content-Type', /html/)
			  .expect(404)
			  .end(function(error, response){
			    if (error) return done(error);
			    done();
			  });
		});
	});
});

describe("Misc", function () {
	it ("should return a favicon", function (done) {
		request(app)
			.get("/favicon.ico")
		  .expect(200)
		  .end(function(error, response){
		    if (error) return done(error);
		    done();
		  });
	});
});

describe("Utils", function () {
	describe("Ping", function () {
		it ("should pong", function (done) {
			request(app)
				.get("/ping")
				.expect(200)
				.expect("Content-Type", /json/)
				.end(function (error, response) {
					if (error) return done(error);
					assert.equal(response.body.result, "pong");
					done();
				});
		});
	});
});