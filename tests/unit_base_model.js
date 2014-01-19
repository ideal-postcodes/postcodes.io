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
	});
	describe("Base model instance methods", function () {
		describe("#_query", function () {
			it ("should execute a query");
			it ("should throw an error if not configured");
		});
	})
});