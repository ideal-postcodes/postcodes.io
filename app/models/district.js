"use strict";

var util = require("util");
var path = require("path");
var AttributeBase = require(path.join(__dirname, "attribute_base.js"));

var TABLE_NAME = "districts";

function District() {
	AttributeBase.call(this, TABLE_NAME);
}

util.inherits(District, AttributeBase);

module.exports = new District();