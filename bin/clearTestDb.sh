#!/usr/bin/env node

var	path = require("path");
var helper = require(path.join(__dirname, "../tests/helper"));

console.log("Tests concluded, wiping DB...");

helper.clearPostcodeDb(function (error, result) {
	if (error) {
		throw error;
	}
	console.log("Done.");
	process.exit(0);
});