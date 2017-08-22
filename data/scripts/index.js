"use strict";

/**
 * @module DataParser
 *
 * Contains methods to aid in the extraction of GSS codes and associated data 
 * from ONSPD data files
 */

const fs = require("fs");
const csv = require("csv");
const path = require("path");
const async = require("async");
const minimist = require('minimist');

/**
 * Extracts data directory from command line flag `-d`
 * @return {string} Path to data directory
 */
const extractDataDirectory = () => {
	const argv = minimist(process.argv.slice(2));
	fs.statSync(argv.d);
	return argv.d;
};

// Returns files paths which cannot be resolved
const testFilesPresent = files => {
	return files.reduce((acc, file) => {
		try {
			fs.statSync(file);
		} catch (e) {
			acc.push(file);
		}
		return acc;
	}, []);
};

/**
 * @callback ExtractionTransform
 * @param {string[]} row - Row of data to be transformed
 * @param {Number} index - Index number of row
 * @returns {string[]} Returns [key, value] of transformed row, return empty array to skip
 */

/**
 * @typedef ExtractionConfig {object}
 * @property {string} file 										- Name of file to be extracted
 * @property {ExtractionTransform} transfrom 	- Function which takes a row of data and 
 * @property {Object} [propName] 							- Raw CSV parser options
 * returns [key, value]
 */

/**
 * Extracts data from files
 * @param {ExtractionConfig[]} configs 	- List of extraction configuration objects
 * @param {function} done 							- Executes when error or result completed
 * @return {undefined}
 */
exports.extract = options => {
	const {configs, done} = options;

	let dataDirectory;
	try {
		dataDirectory = extractDataDirectory();
	} catch (e) {
		return done(new Error("Please specify a data path with `-d`"));
	}

	const toFilePath = f => path.join(dataDirectory, "/", f);
	
	const missing = testFilesPresent(configs.map(c => toFilePath(c.file)));
	if (missing.length) {
		return done(new Error(`Following files cannot be resolved: ${missing.join(", ")}`));
	}

	const output = new Map();

	async.each(configs, (config, done) => {
		const delimiter = config.delimiter || "	";
		const file = toFilePath(config.file);
		const transform = config.transform;
		const parseOptions = Object.assign({
			delimiter: delimiter
		}, config.parseOptions || {});

		fs.createReadStream(file, { encoding: "utf8" })
		.pipe(csv.parse(parseOptions))
		.on("end", done)
		.on("error", done)
		.on("data", (row, index) => {
			const parsedRow = transform(row);
			if (parsedRow.length) {
				output.set(parsedRow[0], parsedRow[1]);
			}
		});
	}, error => {
		if (error) return done(error);
		return done(null, output);
	});
};

/**
 * Transforms map of result to a JSON object ordered by keys
 * @param  {map} map 	- Map of response object
 * @return {string}		- JSON respresentation of result
 */
exports.toJson = map => {
	const result = Array.from(map.keys())
		.sort()
		.reduce((acc, key) => {
			acc[key] = map.get(key);
			return acc;
		}, {});
	return JSON.stringify(result, 2, 2);
};
