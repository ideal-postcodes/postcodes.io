#!/usr/bin/env node

/*
 * Simple TSV parsing script to aid in generating ONS codes from ONS Directories code listing
 *
 */

var async = require("async");
var argv = require('minimist')(process.argv.slice(2));
var fs = require("fs");
var csv = require("csv");
var path = require("path");

if (argv.h) {
	console.log("Commands:");
	console.log("Least last arguments as files. Specifiy as many files as you like");
	console.log("Code Index -ci [Specify the position where the code can be found, 0 indexed, default 0]");
	console.log("Name Index -ni [Specify the position where the name can be found, 0 indexed, default 1]");
	console.log("Skip first line --skip [Skip the first line]");
	process.exit(0);
}

var codeIndex = argv.ci || 0;
var nameIndex = argv.ni || 1;
var skipFirstLine = argv.skip;

var files = argv._;
if (files.length === 0) {
	console.log("Please specifiy a file path or multiple paths");
	process.exit(0);
} else {
	files.forEach(function (file) {
		if (!fs.existsSync(file)) {
			console.log(file, "is not a valid file");
			process.exit(0);
		}
	});
}

var delimiter = "	";

var output = {};

var createCsvStream = function (file) {
	var transform = function (row, index) {
		if (index === 0 && skipFirstLine) {
			return null;
		}
		output[row[codeIndex]] = row[nameIndex];
		return row;
	}

	return function (callback) {
		stream = csv()
			.from
			.stream(fs.createReadStream(file), {
				delimiter: delimiter
			})
			.transform(transform)
			.on('end', function () {
				callback(null);
			})
			.on('error', callback);
	}
};

async.series(files.map(function (file) {
	return createCsvStream(file);
}), function (error) {
	if (error) {
		console.log("An error occurred", error);
		process.exit(0);
	}
	console.log(JSON.stringify(output, 2, 2));
	process.exit(0);
});

