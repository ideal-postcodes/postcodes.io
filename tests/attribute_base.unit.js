var path = require("path");
var assert = require("chai").assert;
var util = require("util");
var helper = require(path.join(__dirname, "/helper"));
var AttributeBase = helper.AttributeBase;

function CustomAttribute () {
	AttributeBase.call(this, "customattribute");
}

util.inherits(CustomAttribute, AttributeBase);

var customAttribute = new CustomAttribute();

describe("AttributeBase model", function () {
	before(function (done) {
		this.timeout(0);
		helper.clearPostcodeDb(function (error, result) {
			if (error) return done(error);
			helper.seedPostcodeDb(function (error, result) {
				if (error) return done(error);
				done();
			});
		})
	});

	describe("_createRelation", function () {
		it ("creates a relation with the correct default attributes", function (done) {
			customAttribute._createRelation(function (error) {
				if (error) return done(error);
				var query = "INSERT INTO " + customAttribute.relation + " (code, name) VALUES ($1, $2) RETURNING *";
				customAttribute._query(query, ["foo", "bar"], function (error, result) {
					if (error) return done(error);
					assert.equal(result.rows.length, 1);
					assert.equal(result.rows[0].code, "foo");
					assert.equal(result.rows[0].name, "bar");
					done();
				});
			});
		});
	});
});