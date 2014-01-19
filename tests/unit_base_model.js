var assert = require("chai").assert,
		path = require("path"),
		helper = require(__dirname + "/helper");

var Base = require(path.join(helper.rootPath, "app/models"));

describe("Base model", function () {
	describe("Connect", function () {
		it ("should connect to postgresql database", function (done) {
			var pg = Base.connect(helper.config, function (error, client, returnClient) {
				if (error) throw error;
				assert.isNotNull(client);
				returnClient();
				done();
			});
		});
		it ("should cache connection for each request");
	});
	describe("Base model instance methods", function () {
		describe("#_query", function () {
			it ("should execute a query", function (done) {
				var base = new Base.Base();
				base._query("SELECT * FROM postcodes LIMIT 1", function (error, result) {
					if (error) throw error;
					assert.isArray(result);
					done();
				});
			});
			it ("should throw an error if not configured");
		});
	});
});