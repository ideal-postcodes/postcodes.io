#!/usr/bin/env node

var fs = require("fs");
var path = require("path");
var async = require("async");
var env = process.env.NODE_ENV || "development";
var Base = require(path.join(__dirname, "../app/models"));
var config = require(path.join(__dirname, "../config/config"))(env);
var District = require(path.join(__dirname, "../app/models/district.js"));
var Ward = require(path.join(__dirname, "../app/models/ward.js"));
var Nuts = require(path.join(__dirname, "../app/models/nuts.js"));
var County = require(path.join(__dirname, "../app/models/county.js"));
var Parish = require(path.join(__dirname, "../app/models/parish.js"));
var Ccg = require(path.join(__dirname, "../app/models/ccg.js"));
var Outcode = require(path.join(__dirname, "../app/models/outcode.js"));
var Constituency = require(path.join(__dirname, "../app/models/constituency.js"));

// Performing checks

function setupSupportTables (callback) {
	console.log("Setting up support tables...");
	var instructions = [
		District._setupTable.bind(District),
		Constituency._setupTable.bind(Constituency),
		County._setupTable.bind(County),
		Ccg._setupTable.bind(Ccg),
		Ward._setupTable.bind(Ward),
		Parish._setupTable.bind(Parish),
		Outcode._setupTable.bind(Outcode)
	];
	async.series(instructions, callback);
}

setupSupportTables(function (error, result) {
	if (error) {
		console.log("An error occurred:", error);
		process.exit(1);
	} else {
		console.log("Completed update.");
		process.exit(0);
	}
});