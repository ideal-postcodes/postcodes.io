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
			  .expect('Content-Length', '20')
			  .expect(200)
			  .end(function(err, res){
			    if (err) throw err;
			    done();
			  });
		});
	});
});