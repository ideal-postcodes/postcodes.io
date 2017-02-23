"use strict";

const TABLE_NAME = "nuts";

const fs = require("fs");
const util = require("util");
const path = require("path");
const async = require("async");
const AttributeBase = require(path.join(__dirname, "attribute_base.js"));

function Model() {
	const schemaAddition = {
		"nuts_code": "VARCHAR(32) NOT NULL",
	};

	AttributeBase.call(this, TABLE_NAME, schemaAddition);
}

util.inherits(Model, AttributeBase);

// Override Seed Data Method
Model.prototype.seedData = function (callback) {
	const self = this;
	const dataPath = path.join(__dirname, "../../data/");
	const dataObject = JSON.parse(fs.readFileSync(path.join(dataPath, self.relation + ".json")));
	const insertQueue = [];

	for (let code in dataObject) {
		insertQueue.push([code, dataObject[code].name, dataObject[code].code]);
	}

	async.parallel(insertQueue.map(elem => {
		return function (callback) {
			const query = `
				INSERT INTO ${self.relation} (code, name, nuts_code) VALUES ($1, $2, $3)
			`;
			self._query(query, elem, callback);
		};
	}), callback);
};

module.exports = new Model();
