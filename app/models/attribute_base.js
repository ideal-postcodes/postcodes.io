"use strict";

/*
 *	Base model for Postcode attributes 
 *
 * 	This includes attributes like district, parishes, etc
 *  The base requirement
 */ 

const fs = require("fs");
const util = require("util");
const path = require("path");
const async = require("async");
const Base = require("./base").Base;

const requiredAttributes = {
	"code": "VARCHAR(32) NOT NULL UNIQUE",
	"name": "VARCHAR(255)"
};

// Note - relation name must match source (.json) file name in data/ directory. E.g. /data/<relation>.json

function AttributeBase(relation, schema, indexes) {
	if (!schema) {
		schema = {};
	}

	// Check if necessary attributes already exists, insert otherwise
	for (let attr in requiredAttributes) {
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
	const hasIndex = indexes.some(elem => {
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
	const self = this;
	const dataPath = path.join(__dirname, "../../data/");
	const dataObject = JSON.parse(fs.readFileSync(path.join(dataPath, self.relation + ".json")));
	const insertQueue = [];

	for (let code in dataObject) {
		insertQueue.push([code, dataObject[code]]);
	}

	async.parallel(insertQueue.map(elem => {
		return callback => {
			const query = `INSERT INTO ${self.relation} (code, name) VALUES ($1, $2)`;
			self._query(query, elem, callback);
		};
	}), callback);
};

AttributeBase.prototype._setupTable = function (callback) {
	const self = this;
	self._destroyRelation(error => {
		if (error) return callback(error);
		self._createRelation(error => {
			if (error) return callback(error);
			self.seedData(error => {
				if (error) return callback(error);
				self.createIndexes(callback);
			});
		});
	});
};

module.exports = AttributeBase;
