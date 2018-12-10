#!/usr/bin/env node

const	path = require("path");
const helper = require(path.join(__dirname, "../tests/helper"));

console.log("Cleaaring test DB");
helper.clearTestDb(error => {
	if (error) throw error;
	console.log("Done.");
	process.exit(0);
});
