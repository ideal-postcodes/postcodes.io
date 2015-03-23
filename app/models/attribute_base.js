"use strict";

/*
 *	Base model for Postcode attributes 
 *
 * 	This includes attributes like district, parishes, etc
 *  The base requirement
 */ 

var fs = require("fs");
var util = require("util");
var path = require("path");
var async = require("async");
var Base = require("./index").Base;
var env = process.env.NODE_ENV || "development";
var defaults = require(path.join(__dirname, "../../config/config.js"))(env).defaults;

var requiredAttributes = {
	"code": "VARCHAR(32) NOT NULL UNIQUE",
	"name": "VARCHAR(255)"
};

// Note - relation name must match source (.json) file name in data/ directory. E.g. /data/<relation>.json

function AttributeBase(relation, schema, indexes) {
	if (!schema) {
		schema = {};
	}

	// Check if necessary attributes already exists, insert otherwise
	for (var attr in requiredAttributes) {
		if (requiredAttributes.hasOwnProperty(attr)) {
			if (!schema[attr]) {
				schema[attr] = requiredAttributes[attr];
			}
		}
	}

	if (!indexes) {
		indexes = [];
	}

	// Check if necessary index already exists, insert index otherwise
	var hasIndex = indexes.some(function (elem) {
		return elem.unique && elem.column === "code";
	});

	if (!hasIndex) {
		indexes.push({
			unique: true,
			column: "code"
		});
	}

	Base.call(this, relation, schema, indexes);
}

util.inherits(AttributeBase, Base);

AttributeBase.prototype.seedData = function (callback) {
	var self = this;
	var dataPath = path.join(__dirname, "../../data/");
	var dataObject = JSON.parse(fs.readFileSync(path.join(dataPath, self.relation + ".json")));
	var insertQueue = [];

	for (var code in dataObject) {
		insertQueue.push([code, dataObject[code]]);
	}

	async.parallel(insertQueue.map(function (elem) {
		return function (callback) {
			var query = "INSERT INTO " + self.relation + " (code, name) VALUES ($1, $2);"
			self._query(query, elem, callback);
		};
	}), callback);
};

AttributeBase.prototype._setupTable = function (callback) {
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

module.exports = AttributeBase;