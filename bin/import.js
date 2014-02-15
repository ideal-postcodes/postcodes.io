#!/usr/bin/env node

var	fs = require("fs"),
		path = require("path"),
		async = require("async"),
		start = process.hrtime(),
		sourceFile = process.argv[2],
		env = process.env.NODE_ENV || "development",
		Base = require(path.join(__dirname, "../app/models")),
		config = require(path.join(__dirname, "../config/config"))(env),
		Postcode = require(path.join(__dirname, "../app/models/postcode.js"));

var pg = Base.connect(config);
// Performing checks

if (!sourceFile) {
	throw new Error("Aborting Import. No source file specified");
}

function dropRelation (callback) {
	console.log("Nuking old postcode database...");
	Postcode._destroyRelation(callback);
}

function createRelation (callback) {
	console.log("Creaing new postcode database...");
	Postcode._createRelation(callback);
}

function dropIndexes (callback) {
	console.log("Dropping indexes...");
	Postcode.destroyIndexes(callback);
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
	console.log("Populating location data...");
	Postcode.populateLocation(callback);
}

function createPostgisExtension(callback) {
	console.log("Enabling POSTGIS extension...")
	Postcode._query("CREATE EXTENSION IF NOT EXISTS postgis", callback);
}

var executionStack = [//createPostgisExtension,
											// dropRelation, 
											// createRelation, 
											// dropIndexes, 
											// importRawCsv,
											populateLocation, 
											recreateIndexes];

async.series(executionStack, function (error, result) {
	if (error) {
		console.log("Unable to complete import process due to error", error);
		process.exit(1);
	}
	console.log("Finished import process in", process.hrtime(start)[0], "seconds");
	process.exit(0);
});
