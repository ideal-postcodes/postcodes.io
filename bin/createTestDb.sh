#!/usr/bin/env node

"use strict";

const path = require("path");
const helper = require(path.join(__dirname, "../test/helper"));
const handleError = error => {
	if (!error) return;
	console.log(`Error stopped test environment creation: ${error.message}`);
	process.exit(1);
};

console.log("Wiping test database...");
helper.clearPostcodeDb((error, result) => {
	handleError(error);
	console.log("Done.");
	console.log("Recreating test database...");
	helper.seedPostcodeDb((error, result) => {
		handleError(error);
		console.log("Done.");
		process.exit(0);
	});
});
