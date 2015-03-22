"use strict";

var fs = require("fs");
var util = require("util");
var path = require("path");
var Base = require("./index").Base;
var env = process.env.NODE_ENV || "development";
var defaults = require(path.join(__dirname, "../../config/config.js"))(env).defaults;

var TABLE_NAME = "districts";

var SCHEMA = {
	"code": "VARCHAR(32)",
	"name": "VARCHAR(255)"
};

var INDEXES = [{
	unique: true,
	column: "code"
}];

function District() {
	Base.call(this, TABLE_NAME, SCHEMA, INDEXES);
}

util.inherits(District, Base);

District.prototype.seedData = function (callback) {
	var self = this;
	var dataPath = path.join(__dirname, "../../data/");
	var districts = JSON.parse(fs.readFileSync(dataPath + "districts.json"));
	var insertQueue = [];

	for (var code in districts) {
		insertQueue.push([code, districts[code]]);
	}

	async.parallel(insertQueue.map(function (elem) {
		return function (callback) {
			var query = "INSERT INTO " + TABLE_NAME + " (code, name) VALUES ($1, $2);"
			self._query(query, elem, callback);
		};
	}), callback);
};

District.prototype._setupTable = function (callback) {
	var self = this;
	self._destroyRelation(function (error) {
		if (error) return callback(error);
		self._createRelation(function (error) {
			if (error) return callback(error);
			self.seedData(function (error) {
				if (error) return callback(error);
				self.createIndexes(callback);
			});
		});
	});
};

module.exports = new District();