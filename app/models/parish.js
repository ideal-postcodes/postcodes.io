"use strict";

const TABLE_NAME = "parishes";

const { inherits } = require("util");
const AttributeBase = require("./attribute_base.js");

function Model() {
	AttributeBase.call(this, TABLE_NAME);
}

inherits(Model, AttributeBase);

module.exports = new Model();

