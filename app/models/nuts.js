"use strict";

var TABLE_NAME = "nuts";

var fs = require("fs");
var path = require("path");
var util = require("util");
var path = require("path");
var async = require("async");
var AttributeBase = require(path.join(__dirname, "attribute_base.js"));

function Model() {
	var schemaAddition = {
		"nuts_code": "VARCHAR(32) NOT NULL",
	};

	AttributeBase.call(this, TABLE_NAME, schemaAddition);
}

util.inherits(Model, AttributeBase);

// Override Seed Data Method
Model.prototype.seedData = function (callback) {
	var self = this;
	var dataPath = path.join(__dirname, "../../data/");
	var dataObject = JSON.parse(fs.readFileSync(path.join(dataPath, self.relation + ".json")));
	var insertQueue = [];

	for (var code in dataObject) {
		insertQueue.push([code, dataObject[code]["name"], dataObject[code]["code"]]);
	}

	async.parallel(insertQueue.map(function (elem) {
		return function (callback) {
			var query = "INSERT INTO " + self.relation + " (code, name, nuts_code) VALUES ($1, $2, $3);"
			self._query(query, elem, callback);
		};
	}), callback);
};

module.exports = new Model();
