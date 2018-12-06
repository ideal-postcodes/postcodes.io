#!/usr/bin/env node

/*
 *
 * This script checks for missing ONS Codes in the ONS Postcode Directory
 *
 * To run: find_missing.js /path/to/postcode/directory.csv
 * To specificy a single type for matches, use `--type=nhsHa`
 * This parses every line of the directory returns result to stdout
 *
 */

"use strict";

const fs = require("fs");
const { parse, transform } = require("csv");
const argv = require('minimist')(process.argv.slice(2));

// Maps postcodes.io code types to ONSPD labels
const onspdSchema = require("../data/onspd_schema.json");
const codeTypeToOnspd = Object.freeze({
	"nhsHa": "oshlthau",
	"counties": "oscty",
	"districts": "oslaua",
	"wards": "osward",
	"parishes": "parish",
	"constituencies": "pcon",
	"european_registers": "eer",
	"regions": "rgn",
	"pcts": "pct",
	"lsoa": "lsoa11",
	"msoa": "msoa11",
	"nuts": "nuts",
	"ccgs": "ccg",
  "ceds": "ced",
});

// List of types to be searched
let codeTypes = Object.keys(codeTypeToOnspd);

// Generate a dictionary of ONSPD types and their offsets in the CSV dataset
const typeOffset = codeTypes.reduce((typeOffset, type) => {
	typeOffset[type] = onspdSchema.map(e => e.code).indexOf(codeTypeToOnspd[type]);
	return typeOffset;
}, {});

// Retrieve ONSPD file
const source = argv._[0];
if (!source || !fs.existsSync(source)) {
	console.log("Please specificy ONSPD Directory source file");
	process.exit(0);
}

// Retrieve optional type argument
const type = argv.type;
if (type) {
	if (!codeTypes.some(codeType => codeType === type )) {
		console.log("Please specify a valid code type using --type=", codeTypes);
		process.exit(0);
	} else {
		codeTypes = [type];
	}
}

// Load data sources and initialise missing type stores
const data = {};
const missingData = {};
codeTypes.forEach(codeType => {
	missingData[codeType] = {};
	data[codeType] = require(`../data/${codeType}.json`);
});

const check = (row, type) => {
	const elem = row[typeOffset[type]];
	if (elem === "") return;
	if (typeof data[type][elem] !== 'undefined') return
	if (typeof missingData[type][elem] !== 'number') missingData[type][elem] = 0;
	missingData[type][elem] += 1;
};

fs.createReadStream(source)
	.pipe(parse({delimiter: ","}))
	.on("data", row => {
		if (row[4].length !== 0) return null; // Skip row if terminated postcode
		codeTypes.forEach(codeType => check(row, codeType));
	})
	.on("end", () => {
		console.log(JSON.stringify(missingData, 2, 2));
	  process.exit(0);
	})
	.on("error", error => {
		console.log(error.message);
	  process.exit(1);
	});
