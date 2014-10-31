#!/usr/bin/env node

var	fs = require("fs");
var path = require("path");
var async = require("async");
var start = process.hrtime();
var sourceFile = process.argv[2];
var env = process.env.NODE_ENV || "development";
var Base = require(path.join(__dirname, "../app/models"));
var config = require(path.join(__dirname, "../config/config"))(env);
var Postcode = require(path.join(__dirname, "../app/models/postcode.js"));

var oldRelationName = Postcode.relation;
Postcode.relation = "new_postcode_database"; // Create temp alternate database

var pg = Base.connect(config);
// Performing checks

if (!sourceFile) {
	throw new Error("Aborting Import. No source file specified");
}

function createPostgisExtension(callback) {
	console.log("Enabling POSTGIS extension...")
	Postcode._query("CREATE EXTENSION IF NOT EXISTS postgis", callback);
}

function dropRelation (callback) {
	console.log("Nuking old update relation...");
	Postcode._destroyRelation(callback);
}

function createRelation (callback) {
	console.log("Creaing new update relation...");
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
	console.log("Populating location data...");
	Postcode.populateLocation(callback);
}


function dropOldRelation(callback) {
	Postcode._query("DROP TABLE IF EXISTS " + oldRelationName + " CASCADE", callback);
}

function renameNewRelation(callback) {
	Postcode._query("ALTER TABLE " + Postcode.relation + " RENAME TO " + oldRelationName, callback);
}

var executionStack = [createPostgisExtension,
											dropRelation, 
											createRelation, 
											importRawCsv,
											populateLocation, 
											recreateIndexes
											// dropOldRelation,
											// renameNewRelation
											];

async.series(executionStack, function (error, result) {
	if (error) {
		console.log("Unable to complete import process due to error", error);
		console.log("Dropping newly created relation")
		dropRelation(function (error, result) {
			if (error) {
				console.log("Unabled to drop relation");
				process.exit(1);		
			}		
		});
	}
	console.log("Finished import process in", process.hrtime(start)[0], "seconds");
	process.exit(0);
});
