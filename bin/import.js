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

const async = require("async");
const prompt = require("prompt");
const Postcode = require("../app/models/postcode.js");
const TerminatedPostcode = require("../app/models/terminated_postcode.js")
const District = require("../app/models/district.js");
const Ward = require("../app/models/ward.js");
const Nuts = require("../app/models/nuts.js");
const County = require("../app/models/county.js");
const Parish = require("../app/models/parish.js");
const Ccg = require("../app/models/ccg.js");
const Outcode = require("../app/models/outcode.js");
const Constituency = require("../app/models/constituency.js");
const { toTempName, setupWithTableSwap } = require("../app/models/index.js");

if (!sourceFile) {
	console.log("Aborting Import. No source file specified");
	return process.exit(1);
}

const supportTables = [
	District,
	Constituency,
	County,
	Ccg,
	Ward,
	Nuts,
	Parish,
];

const streamedTables = [
	Postcode,
	TerminatedPostcode,
	Outcode,
];

const dropTempTables = callback => {
	console.log("Dropping any temporary tables");
	const queries = []
		.concat(streamedTables)
		.concat(supportTables)
		.map(Model => `DROP TABLE IF EXISTS ${toTempName(Model.relation)}`);
	async.forEach(queries, Postcode._query.bind(Postcode), callback);
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

const setupSupportTables = callback => {
	console.log("Setting up support tables...");
	async.series(supportTables.map(Model => {
		console.log(`Building support table: ${Model.relation}...`);
		return cb => Model._setupTable.call(Model, cb);
	}), callback);
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
	async.series([
		createPostgisExtension,
		dropTempTables,
		setupPostcodesTable,
	  setupTerminatedPostcodesTable,
	  setupSupportTables,
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
