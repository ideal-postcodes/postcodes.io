"use strict";

var TABLE_NAME = "districts";

var util = require("util");
var path = require("path");
var AttributeBase = require(path.join(__dirname, "attribute_base.js"));

function Model() {
	AttributeBase.call(this, TABLE_NAME);
}

util.inherits(Model, AttributeBase);

module.exports = new Model();