"use strict";

const path = require("path");

module.exports = config => {
	const Base = require(path.join(__dirname, "../app/models"));
	return Base.connect(config);
};
