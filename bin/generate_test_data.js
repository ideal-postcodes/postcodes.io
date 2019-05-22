#!/usr/bin/env node

"use strict"


const fs = require("fs");
const path = require("path");
const csv = require("csv")
const dataPath = process.argv[process.argv.length - 1]

const MAX_DATASET = 5000;
const DESTINATION = path.join(__dirname, "../test/seed/postcode.csv");

const parser = csv.parse({ delimiter: "," });
const stringifier = csv.stringify();
const transformer = csv.transform((row, callback) => {
	if (row[4].length !== 0) return callback(null, null); // Skip if expired
	if (currentSize > MAX_DATASET) {
		if (!finished) stream.pause();
		finished = true;
		return callback(null, null);
	}
	currentSize += 1;
  return callback(null, row);
});

let currentSize = 0;
let finished = false;

const handleError = error => {
	console.log("An error occurred:");
	console.log(error.message);
	process.exit(1);
};

const writeStream = fs.createWriteStream(DESTINATION, {encoding: "utf8"})
	.on("drain", () => {
		if (!finished) return;
		console.log("Completed dump.")
	  console.log(`Stored at ${path.join(__dirname)}/postcodes.csv`);
	  process.exit(0);
	})
	.on("error", handleError);

const stream = fs.createReadStream(dataPath, {encoding: "utf8"});
stream.pipe(parser)
	.pipe(transformer)
	.pipe(stringifier)
	.pipe(writeStream)
	.on("error", handleError);
