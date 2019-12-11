"use strict";

const TABLE_NAME = "ccgs";

const { inherits } = require("util");
const path = require("path");
const fs = require("fs");
const async = require("async");
const AttributeBase = require("./attribute_base.js");

function Model() {
  const schemaAddition = {
    "ccg19cdh": "VARCHAR(32) NULL UNIQUE",
  };
  
	AttributeBase.call(this, TABLE_NAME, schemaAddition);
}

inherits(Model, AttributeBase);

// Override Seed Data Method
Model.prototype.seedData = function (callback) {
  const self = this;
  const dataPath = path.join(__dirname, "../../data/");
  const dataObject = JSON.parse(fs.readFileSync(path.join(dataPath, self.relation + ".json")));
  const insertQueue = [];
  
  for (let code in dataObject) {
    insertQueue.push([code, dataObject[code].name, dataObject[code].ccg19cdh]);
  }
  
  async.parallel(insertQueue.map(elem => {
    return function (callback) {
      const query = `
				INSERT INTO ${self.relation} (code, name, ccg19cdh) VALUES ($1, $2, $3)
			`;
      self._query(query, elem, callback);
    };
  }), callback);
};

module.exports = new Model();

