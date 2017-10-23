#!/usr/bin/env node

"use strict";

console.log("Postcodes.io OS Places Import Script");

const fs = require("fs");
const path = require("path");
const async = require("async");
const start = process.hrtime();
const prompt = require("prompt");
const sourceDirectory = process.argv[2];
const env = process.env.NODE_ENV || "development";
const Base = require(path.join(__dirname, "../app/models"));
const config = require(path.join(__dirname, "../config/config"))(env);
const Place = require(path.join(__dirname, "../app/models/place.js"));

// Performing checks

if (!sourceDirectory) {
	throw new Error("Aborting Import. No source file specified");
}

function dropRelation (callback) {
	console.log("Deleting old places relation...");
	Place._destroyRelation(callback);
}

function createRelation (callback) {
	console.log("Creaing new places relation...");
	Place._createRelation(callback);
}

function recreateIndexes(callback) {
	console.log("Rebuilding indexes...");
	Place.createIndexes(callback);
}

function importRawCsv (callback) {
	console.log("Importing CSV data from", sourceDirectory);
	Place.seedData(sourceDirectory, callback);
}

function populateLocation (callback) {
	console.log("Populating location data...");
	Place.populateLocation(callback);
}

function generateSearchFields (callback) {
	console.log("Populating search data...");
	Place.generateSearchFields(callback);
}

function generateTsSearchFields (callback) {
	console.log("Populating ts_searching data...");
	Place.generateTsSearchFields(callback);
}

function createPostgisExtension(callback) {
	console.log("Enabling POSTGIS extension...");
	Place._query("CREATE EXTENSION IF NOT EXISTS postgis", callback);
}

function createUnaccentExtension(callback) {
	console.log("Enabling UNACCENT extension...");
	Place._query("CREATE EXTENSION IF NOT EXISTS unaccent", callback);
}

const executionStack = [
	createPostgisExtension,
	createUnaccentExtension,
	dropRelation, 
	createRelation, 
	importRawCsv,
	populateLocation, 
	generateSearchFields,
	generateTsSearchFields, 
	recreateIndexes
];

function startImport () {
	async.series(executionStack, (error, result) => {
		if (error) {
			console.log("Unable to complete import process due to error", error);
			console.log("Dropping newly created relation")
			dropRelation((error, result) => {
				if (error) {
					console.log("Unabled to drop relation");
					process.exit(1);		
				}		
			});
		}
		console.log("Finished import process in", process.hrtime(start)[0], "seconds");
		process.exit(0);
	});
}

prompt.start();

const promptMessage = `
	Importing data will wipe your current places dataset before continuing
	If you already have existing data please consider using updateons
	Type YES to continue
`;

prompt.get([{
	description: promptMessage,
  name: 'userIsSure', 
  warning: 'Username must be only letters, spaces, or dashes'
}], (error, result) => {
	if (error) {
		console.log(error);
		process.exit(1);
	}
	if (result.userIsSure === "YES") {
		startImport();
	} else {
		console.log("You have opted to cancel the import process");
		process.exit(0);
	}
});
