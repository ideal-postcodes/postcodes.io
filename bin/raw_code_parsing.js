#!/usr/bin/env node

/*
 * Simple TSV parsing script to aid in generating ONS codes from ONS Directories code listing
 *
 */

"use strict";

const fs = require("fs");
const csv = require("csv");
const async = require("async");
const argv = require('minimist')(process.argv.slice(2));

if (argv.h) {
	console.log("Commands:");
	console.log("Least last arguments as files. Specifiy as many files as you like");
	console.log("Code Index -ci [Specify the position where the code can be found, 0 indexed, default 0]");
	console.log("Name Index -ni [Specify the position where the name can be found, 0 indexed, default 1]");
	console.log("Skip first line --skip [Skip the first line]");
	process.exit(0);
}

const codeIndex = argv.ci || 0;
const nameIndex = argv.ni || 1;
const skipFirstLine = argv.skip;

const files = argv._;
if (files.length === 0) {
	console.log("Please specifiy a file path or multiple paths");
	process.exit(0);
} else {
	files.forEach(file => {
		if (!fs.existsSync(file)) {
			console.log(file, "is not a valid file");
			process.exit(0);
		}
	});
}

const delimiter = "	";

const output = {};

const createCsvStream = file => {
	let index = -1;
	const parseData = row => {
		index += 1;
		if (index === 0 && skipFirstLine) return null;
		output[row[codeIndex]] = row[nameIndex];
		return row;
	}

	return callback => {
		fs.createReadStream(file, { encoding: 'utf8' })
		.pipe(csv.parse({ delimiter: delimiter }))
		.on("data", parseData)
		.on('finish', () => callback(null))
		.on('error', callback);
	};
};

async.series(files.map(f => createCsvStream(f)), error => {
	if (error) {
		console.log("An error occurred", error);
		process.exit(0);
	}
	console.log(JSON.stringify(output, 2, 2));
	process.exit(0);
});
