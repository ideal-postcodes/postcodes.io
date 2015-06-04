"use strict";

var fs = require("fs");
var S = require("string");
var util = require("util");
var path = require("path");
var async = require("async");
var Base = require("./index").Base;
var env = process.env.NODE_ENV || "development";
var Postcode = require("./postcode");
var defaults = require(path.join(__dirname, "../../config/config.js"))(env).defaults;

var outcodeSchema = {
	"id": "SERIAL PRIMARY KEY",
	"outcode": "VARCHAR(5)",
	"longitude": "DOUBLE PRECISION",
	"latitude": "DOUBLE PRECISION",
	"location": "GEOGRAPHY(Point, 4326)",
	"northings": "INTEGER",
	"eastings": "INTEGER",
	"admin_district": "VARCHAR(255)[]",
	"parish": "VARCHAR(255)[]",
	"admin_county": "VARCHAR(255)[]",
	"admin_ward": "VARCHAR(255)[]"
};

var indexes = [{
	unique: true,
	column: "outcode"
}, {
	type: "GIST",
	column: "location"
}]


function Outcode() {
	Base.call(this, "outcodes", outcodeSchema, indexes);
}

util.inherits(Outcode, Base);

Outcode.prototype.populateLocation = function (callback) {
	var query = "UPDATE " + this.relation + " SET location=ST_GeogFromText" + 
							"('SRID=4326;POINT(' || longitude || ' ' || latitude || ')')" + 
							" WHERE northings!=0 AND EASTINGS!=0";
	this._query(query, callback);
};

Outcode.prototype.seedData = function (callback) {
	var self = this;
	// Create list of unique outcodes
	self._query("SELECT DISTINCT outcode FROM postcodes", function (error, result) {
		if (error) return callback(error);
		async.each(result.rows, function (row, callback) {
			var outcode = row.outcode;
			Postcode.findOutcode(outcode, function (error, outcode) {
				outcode.northings = parseInt(outcode.northings, 10);
				outcode.eastings = parseInt(outcode.eastings, 10);
				self._create(outcode, callback);
			});
		}, callback);
	});
};

Outcode.prototype._setupTable = function (callback) {
	var self = this;
	async.series([
		self._destroyRelation.bind(self),
		self._createRelation.bind(self),
		self.seedData.bind(self),
		self.populateLocation.bind(self),
		self.createIndexes.bind(self)
	], callback);
};

Outcode.prototype.find = function (outcode, callback) {
	var self = this;
	if (typeof outcode !== "string") {
		return callback(null, null);
	}
	var query = ["SELECT * FROM", this.relation, "WHERE outcode=$1"].join(" ");
	var params = [outcode.toUpperCase()];
	self._query(query, params, function (error, result) {
		if (error) return callback(error);
		if (result.rows.length === 0) {
			return callback(null, null);
		} else {
			return callback(null, result.rows[0]);
		}
	});
};

module.exports = new Outcode();