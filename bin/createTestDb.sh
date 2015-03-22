#!/usr/bin/env node

var	path = require("path");
var helper = require(path.join(__dirname, "../tests/helper"));

console.log("Wiping test database...");
helper.clearPostcodeDb(function (error, result) {
	if (error) {
		throw error;
	}
	console.log("Done.");
	console.log("Recreating test database...");
	helper.seedPostcodeDb(function (error, result) {
		if (error) {
			throw error;
		}
		console.log("Done.");
		process.exit(0);
	});
});