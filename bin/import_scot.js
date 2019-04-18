#!/usr/bin/env node

"use strict";

const sourceFile = process.argv[2];
const large = (process.argv[3] === "--large");

const message = `
Postcodes.io Scottish Postcode Directory Import Script

This import script will populate existing tables from the ONSPD with data 
from the Scottish Postcode Directory file found at ${sourceFile}

This is designed to be ran after the main ONSPD import - RUN THAT FIRST

If you're importing a Large User postcode file, you need to put the --large
parameter at the end of this command, as the format is slightly different

Type 'YES' to continue
`;

const prompt = require("prompt");
const {series} = require("async");
const {Postcode} = require("../app/models/index.js");

if (!sourceFile) {
	console.log("Aborting Import. No source file specified");
	return process.exit(1);
}

const importPostcodeData = callback => {
	console.log("Importing postcodes...");
	Postcode.seedPostcodes(sourceFile, callback, true, large);
};

prompt.start();

prompt.get([{
	message: message,
  name: 'confirmation',
}], function (error, result) {
	if (error) {
		console.log(error);
		return process.exit(1);
	}

	if (result.confirmation !== "YES") {
		console.log("You have opted to cancel the import process");
		return process.exit(0);
	}

	const start = process.hrtime();

	series([
		importPostcodeData
	], error => {
		if (error) {
			console.log("Unable to complete import process due to error:", JSON.stringify(error, 2, 2));
			return process.exit(1);
		}
		console.log(`Finished import process in ${process.hrtime(start)[0]} seconds`);
		process.exit(0);
	});
});