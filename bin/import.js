#!/usr/bin/env node

var	fs = require("fs"),
		path = require("path"),
		async = require("async"),
		start = process.hrtime(),
		sourceFolder = process.argv[2],
		env = process.env.NODE_ENV || "development",
		Base = require(path.join(__dirname, "../app/models")),
		config = require(path.join(__dirname, "../config/config"))(env),
		Postcode = require(path.join(__dirname, "../app/models/postcode.js"));

var pg = Base.connect(config);
// Performing checks

if (!sourceFolder) {
	throw new Error("Aborting Import. No folder specified");
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
	console.log("Importing CSV data from", sourceFolder);
	var importQueue = [],
			csvFiles = fs.readdirSync(sourceFolder).filter(function (elem) {
				return elem.match(/\.csv$/);
			});

	csvFiles.forEach(function (file) {
		importQueue.push(function (callback) {
			console.log("Streaming source file:", path.join(sourceFolder, file), "to Postgres");
			Postcode.seedPostcodes(path.join(sourceFolder, file), callback);
		});
	});

	async.series(importQueue, function (error, result) {
		if (error) {
			console.log("Unabled to import data due to error:", error);
		}
		callback(error, result);
	});
}

function createPostgisExtension(callback) {
	console.log("Enabling POSTGIS extension...")
	Postcode._query("CREATE EXTENSION IF NOT EXISTS postgis", function (error, result) {
		if (error) {
			throw new Error("Unabled to create extension. This may be because you" +
											" don't have PostGIS installed. Error", error);
		}
		callback(null, result);
	});
}

var executionStack = [createPostgisExtension,
											dropRelation, 
											createRelation, 
											dropIndexes, 
											importRawCsv, 
											recreateIndexes];

async.series(executionStack, function (error, result) {
	if (error) {
		console.log("Cancelling import process due to error", error);
		process.exit(1);
	}
	console.log("Finished import process in", process.hrtime(start)[0], "seconds");
	process.exit(0);
});
