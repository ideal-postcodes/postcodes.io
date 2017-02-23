"use strict";

const TABLE_NAME = "counties";

const util = require("util");
const path = require("path");
const AttributeBase = require(path.join(__dirname, "attribute_base.js"));

function Model() {
	AttributeBase.call(this, TABLE_NAME);
}

util.inherits(Model, AttributeBase);

module.exports = new Model();
