"use strict";

const TABLE_NAME = "ccgs";

const { inherits } = require("util");
const AttributeBase = require("./attribute_base.js");

function Model() {
  const schemaAddition = {
    "ccg19cdh": "VARCHAR(32) NULL UNIQUE",
  };
  
	AttributeBase.call(this, TABLE_NAME, schemaAddition);
}

inherits(Model, AttributeBase);

module.exports = new Model();

