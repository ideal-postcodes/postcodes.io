#!/usr/bin/env node

"use strict";

const sourceFile = process.argv[2];

const message = `
Postcodes.io ONS Postcode Directory Import Script

This import script will populate temporary new tables with data from the
postcodes.io data repository or the ONSPD file found at ${sourceFile}

Once a table has been populated, any pre-existing tables will be swapped out
into an archived relation and the newly populated table swapped in. Should 
you experience any failures, you can swap back the archived table to restore
your previous dataset

Type 'YES' to continue
`;

const prompt = require("prompt");
const { forEach, series } = require("async");
const {
  Postcode,
  TerminatedPostcode,
  Outcode,
} = require("../app/models/index.js");
const { toTempName, setupWithTableSwap } = require("../app/models/base.js");
const { SUPPORT_TABLES, setupSupportTables } = require("../app/lib/setup.js");

if (!sourceFile) {
	console.log("Aborting Import. No source file specified");
	return process.exit(1);
}

const dropTempTables = callback => {
  console.log("Dropping any temporary tables");
  const deletes = [Postcode, TerminatedPostcode, Outcode]
    .concat(SUPPORT_TABLES)
    .map(Model => `DROP TABLE IF EXISTS ${toTempName(Model.relation)}`);
  forEach(deletes, Postcode._query.bind(Postcode), callback);
};

const createPostgisExtension = callback => {
	console.log("Enabling POSTGIS extension...")
	Postcode._query("CREATE EXTENSION IF NOT EXISTS postgis", callback);
};

const setupTerminatedPostcodesTable  = callback => {
	console.log("Building terminated postcodes table...");
	setupWithTableSwap(TerminatedPostcode, sourceFile)(callback);
};

const setupOutcodeTable = callback => {
	console.log("Building outcodes table...");
	setupWithTableSwap(Outcode)(callback);
};

const setupPostcodesTable = callback => {
	console.log("Building postcodes table...");
	setupWithTableSwap(Postcode, sourceFile)(callback);
};

const setupDataTables = (callback) => {
	console.log("Setting up support tables...");
  setupSupportTables()
    .then(result => callback(null, result))
    .catch(error => callback(error));
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
		createPostgisExtension,
		dropTempTables,
		setupPostcodesTable,
	  setupTerminatedPostcodesTable,
	  setupDataTables,
    setupOutcodeTable,
	], error => {
		if (error) {
			console.log("Unable to complete import process due to error:", JSON.stringify(error, 2, 2));
			return process.exit(1);
		}
		console.log(`Finished import process in ${process.hrtime(start)[0]} seconds`);
		process.exit(0);
	});
});
