#!/usr/bin/env node

"use strict";

const sourceDirectory = process.argv[2];

const message = `
Postcodes.io OS Open Names Import Script

Importing data will wipe your current places dataset and rebuild it using the
datafiles listed at ${sourceDirectory}

Type 'YES' to continue
`;

const fs = require("fs");
const async = require("async");
const prompt = require("prompt");
const Place = require("../app/models/place.js");
const { toTempName, setupWithTableSwap } = require("../app/models/base.js");

if (!sourceDirectory) {
	console.log("Aborting Import. No source directory specified");
	return process.exit(1);
}

const createPostgisExtension = callback => {
	console.log("Enabling POSTGIS extension...");
	Place._query("CREATE EXTENSION IF NOT EXISTS postgis", callback);
};

const createUnaccentExtension = callback => {
	console.log("Enabling UNACCENT extension...");
	Place._query("CREATE EXTENSION IF NOT EXISTS unaccent", callback);
};

const dropTempTables = callback => {
	console.log("Dropping any temporary tables...");
	Place._query(`DROP TABLE IF EXISTS ${toTempName(Place.relation)}`, callback);
};

const setupPlaceTable = callback => {
	console.log("Building places table...");
	setupWithTableSwap(Place, sourceDirectory)(callback);
};

prompt.start();

prompt.get([{
	message: message,
  name: 'confirmation',
}], (error, result) => {
	if (error) {
		console.log(error);
		process.exit(1);
	}

	if (result.confirmation !== "YES") {
		console.log("You have opted to cancel the import process");
		return process.exit(0);
	}

	const start = process.hrtime();
	async.series([
		createPostgisExtension,
		createUnaccentExtension,
		dropTempTables,
		setupPlaceTable,
	], error => {
		if (error) {
			console.log("Unable to complete import process due to error:", JSON.stringify(error, 2, 2));
			return process.exit(1);
		}
		console.log(`Finished import process in ${process.hrtime(start)[0]} seconds`);
		process.exit(0);
	});
});
