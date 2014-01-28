#!/usr/bin/env node
var env = process.env.NODE_ENV || "development",
		fs = require("fs"),
		path = require("path"),
		async = require("async"),
		config = require(path.join(__dirname, "../config/config"))(env),
		Base = require(path.join(__dirname, "../app/models")),
		Postcode = require(path.join(__dirname, "../app/models/postcode.js")),
		sourceFolder = process.argv[2],
		pg = Base.connect(config),
		start = process.hrtime();

// Performing checks

if (!sourceFolder) {
	throw new Error("Aborting Import. No folder specified");
}

function clearPostcodes (callback) {
	console.log("Clearing existing data.");
	Postcode.clear(callback);
}

function dropIndexes (callback) {
	console.log("Dropping indexes.");
	Postcode.destroyIndexes(callback);
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

function recreateIndexes(callback) {
	console.log("Rebuilding indexes.");
	Postcode.createIndexes(callback);
}

var executionStack = [clearPostcodes, dropIndexes, importRawCsv, recreateIndexes];

async.series(executionStack, function (error, result) {
	if (error) {
		console.log("Cancelling import process due to error", error);
		process.exit(1);
	}
	console.log("Finished import process in", process.hrtime(start)[0], "seconds");
	process.exit(0);
});
