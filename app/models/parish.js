"use strict";

var util = require("util");
var path = require("path");
var AttributeBase = require(path.join(__dirname, "attribute_base.js"));

var TABLE_NAME = "parishes";

function Parish() {
	AttributeBase.call(this, TABLE_NAME);
}

util.inherits(Parish, AttributeBase);

module.exports = new Parish();