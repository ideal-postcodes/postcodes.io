#!/usr/bin/env node
var env = process.env.NODE_ENV || "development",
		fs = require("fs"),
		path = require("path"),
		async = require("async"),
		config = require(path.join(__dirname, "../config/config"))(env),
		Base = require(path.join(__dirname, "../app/models")),
		Postcode = require(path.join(__dirname, "../app/models/postcode.js")),
		sourceFolder = process.argv[2],
		pg = Base.connect(config);

if (!sourceFolder) {
	throw new Error("Aborting Import. No folder specified");
}

var csvFiles = fs.readdirSync(sourceFolder).filter(function (elem) {
	return elem.match(/\.csv$/);
});

var executionQueue = [];

csvFiles.forEach(function (file) {
	executionQueue.push(function (callback) {
		console.log("Streaming source file:", path.join(sourceFolder, file), "to Postgres");
		Postcode.seedPostcodes(path.join(sourceFolder, file), callback);
	});
});

// Todo remove and add back indexes

async.series(executionQueue, function (error, result) {
	if (error) {
		console.log("Unable to import data due to error", error);
		console.log("Cleaning up data");
		Postcode._query("DELETE FROM postcodes", function (error, result) {
			if (error) throw error;
			console.log("Cleared Postcodes table");
			process.exit(1);	
		})
	} else {
		console.log("Successfully imported data");
		process.exit(0);
	}
});