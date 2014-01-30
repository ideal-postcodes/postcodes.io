#!/usr/bin/env node

var	fs = require("fs"),
		path = require("path"),
		async = require("async"),
		start = process.hrtime(),
		pg = Base.connect(config),
		sourceFolder = process.argv[2],
		env = process.env.NODE_ENV || "development",
		Base = require(path.join(__dirname, "../app/models")),
		config = require(path.join(__dirname, "../config/config"))(env),
		Postcode = require(path.join(__dirname, "../app/models/postcode.js"));

// Performing checks

if (!sourceFolder) {
	throw new Error("Aborting Import. No folder specified");
}

function dropRelation (callback) {
	console.log("Nuking old postcode database...");
	Postcode.clear(callback);
}

function createRelation (callback) {
	console.log("Creaing new postcode database...");
}

function dropIndexes (callback) {
	console.log("Dropping indexes...");
	Postcode.destroyIndexes(callback);
}

function compactPostcodes(callback) {
	console.log("Compacting postcodes...");
	var query = "UPDATE postcodes SET pc_compact = replace(postcode, ' ', '')";
	Postcode._query("", callback);
}

function createLocationData(callback) {
	console.log("Loading location data into database...")
	var query = "UPDATE postcode_locations SET location =" 
					 + " ST_GeogFromText('SRID=4326;POINT(' || longitude || ' ' || latitude || ')')";
	Postcode._query(query, callback);
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

var executionStack = [dropRelation, 
											createRelation, 
											dropIndexes, 
											importRawCsv, 
											compactPostcodes,
											createLocationData,
											recreateIndexes];

async.series(executionStack, function (error, result) {
	if (error) {
		console.log("Cancelling import process due to error", error);
		process.exit(1);
	}
	console.log("Finished import process in", process.hrtime(start)[0], "seconds");
	process.exit(0);
});
