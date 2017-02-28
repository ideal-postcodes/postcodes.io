#!/usr/bin/env node

/*
 *
 * This script checks for missing ONS Codes in the ONS Postcode Directory
 *
 * To run: find_missing.js /path/to/postcode/directory.csv
 *
 * This parses every line of the directory returns result to stdout
 *
 */

"use strict";

const fs = require("fs");
const path = require("path");
const csv = require("csv");
const parse = csv.parse;
const transform = csv.transform;
const argv = require('minimist')(process.argv.slice(2));

const codeTypes = [
	"nhsHa",
	"counties",
	"districts",
	"wards",
	"parishes",
	"constituencies",
	"european_registers",
	"regions",
	"pcts",
	"lsoa",
	"msoa",
	"nuts",
	"ccgs"
];

const typeOffset = {
	nhsHa: 12,
	counties: 5,
	districts: 6,
	wards: 7,
	parishes: 44,
	constituencies: 17,
	european_registers: 18,
	regions: 15,
	pcts: 21,
	lsoa: 42,
	msoa: 43,
	nuts: 22,
	ccgs: 46
};

const source = argv._[0];
if (!source || !fs.existsSync(source)) {
	console.log("Please specificy ONSPD Directory source file");
	process.exit(0);
}

const type = argv.type;
if (type) {
	if (!codeTypes.some(codeType => codeType === type )) {
		console.log("Please specify a valid code type using --type=", codeTypes);
		process.exit(0);
	} else {
		codeTypes = [type];
	}
}

// Load data sources
const data = {};
const missingData = {};
codeTypes.forEach(codeType => {
	missingData[codeType] = {};
	data[codeType] = require(`../data/${codeType}.json`);
});

const check = (row, type) => {
	const elem = row[typeOffset[type]];
	if (elem === "") {
		return;
	} else {
		if (typeof data[type][elem] === 'undefined') {
			if (typeof missingData[type][elem] !== 'number') {
				missingData[type][elem] = 0;
			} else {
				missingData[type][elem] += 1;
			}
		}
	}
};

const parser = parse({delimiter: ","});

fs.createReadStream(source)
	.pipe(parser)
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
