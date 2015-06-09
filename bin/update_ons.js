#!/usr/bin/env node

console.log("Postcodes.io ONS Postcode Directory Update Script");

var fs = require("fs");
var path = require("path");
var async = require("async");
var start = process.hrtime();
var prompt = require("prompt");
var sourceFile = process.argv[2];
var env = process.env.NODE_ENV || "development";
var Base = require(path.join(__dirname, "../app/models"));
var config = require(path.join(__dirname, "../config/config"))(env);
var Postcode = require(path.join(__dirname, "../app/models/postcode.js"));
var District = require(path.join(__dirname, "../app/models/district.js"));
var Ward = require(path.join(__dirname, "../app/models/ward.js"));
var County = require(path.join(__dirname, "../app/models/county.js"));
var Parish = require(path.join(__dirname, "../app/models/parish.js"));
var Ccg = require(path.join(__dirname, "../app/models/ccg.js"));
var Outcode = require(path.join(__dirname, "../app/models/outcode.js"));

var pg = Base.connect(config);
// Performing checks

Postcode.relation = "postcodes_new";

if (!sourceFile) {
	throw new Error("Aborting Import. No source file specified");
}

function dropRelation (callback) {
	console.log("Nuking old postcode database...");
	Postcode._destroyRelation(callback);
}

function createRelation (callback) {
	console.log("Creaing new postcode database as postcodes_new...");
	Postcode._createRelation(callback);
}

function recreateIndexes(callback) {
	console.log("Rebuilding indexes...");
	Postcode.createIndexes(callback);
}

function importRawCsv (callback) {
	console.log("Importing CSV data from", sourceFile);
	Postcode.seedPostcodes(sourceFile, callback);
}

function populateLocation (callback) {
	console.log("Populating location data into postcodes_new...");
	Postcode.populateLocation(callback);
}

function setupSupportTables (callback) {
	console.log("Setting up support tables...");
	var instructions = [
		District._setupTable.bind(District),
		County._setupTable.bind(County),
		Ccg._setupTable.bind(Ccg),
		Ward._setupTable.bind(Ward),
		Parish._setupTable.bind(Parish)
	];
	async.series(instructions, callback);
}

function setupOutcodeTable(callback) {
	console.log("Building outcodes table...");
	Outcode._setupTable(callback);
}

function createPostgisExtension(callback) {
	console.log("Enabling POSTGIS extension...")
	Postcode._query("CREATE EXTENSION IF NOT EXISTS postgis", callback);
}

function clearPostcodeArchive(callback) {
	console.log("Archiving old postcode table as postcodes_archive");
	Postcode._query("DROP TABLE IF EXISTS postcodes_archive CASCADE", callback);
}

function archiveOldPostcodes(callback) {
	console.log("Archiving current postcode");
	Postcode._query("ALTER TABLE postcodes RENAME TO postcodes_archive", callback);
}

function renameNewPostcodes(callback) {
	console.log("Loading in new postcodes table");
	Postcode._query("ALTER TABLE postcodes_new RENAME TO postcodes", callback);	
}

var executionStack = [dropRelation, 
											setupSupportTables,
											createRelation, 
											importRawCsv,
											populateLocation, 
											recreateIndexes,
											clearPostcodeArchive,
											archiveOldPostcodes,
											renameNewPostcodes,
											setupOutcodeTable];

function startImport () {
	async.series(executionStack, function (error, result) {
		if (error) {
			console.log("Unable to complete import process due to error", error);
			console.log("Dropping newly created relation")
			process.exit(1);		
		}
		console.log("Finished update process");
		console.log("Remember to drop backup table postcodes_archive if you don't require it");
		process.exit(0);
	});
}

startImport();
