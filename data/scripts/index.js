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
 * Default handler if no done method specified for `extract`
 * Program will either terminate with status code 0 (success) or 1 (error)
 * @param  {Error} error   - Error to be handled
 * @param  {string} result - JSON string to be printed
 * @return {undefined} 
 */
const defaultHandler = (error, result) => {
	if (error) {
		console.log(error);
		process.exit(1);
	}
	console.log(toJson(result));
	process.exit(0);
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

	const callback = (typeof done === "function") ? done : defaultHandler;

	let dataDirectory;
	try {
		dataDirectory = extractDataDirectory();
	} catch (e) {
		return callback(new Error("Please specify a data path with `-d`"));
	}

	const toFilePath = f => path.join(dataDirectory, "/", f);
	
	const missing = testFilesPresent(configs.map(c => toFilePath(c.file)));
	if (missing.length) {
		return callback(new Error(`Following files cannot be resolved: ${missing.join(", ")}`));
	}

	const output = new Map();

	async.each(configs, (config, next) => {
		const delimiter = config.delimiter || "	";
		const file = toFilePath(config.file);
		const transform = config.transform;
		const parseOptions = Object.assign({
			delimiter: delimiter
		}, config.parseOptions || {});

		fs.createReadStream(file, { encoding: "utf8" })
		.pipe(csv.parse(parseOptions))
		.on("end", next)
		.on("error", next)
		.on("data", (row, index) => {
			const parsedRow = transform(row);
			if (parsedRow.length) {
				output.set(parsedRow[0], parsedRow[1]);
			}
		});
	}, error => {
		if (error) return callback(error);
		return callback(null, output);
	});
};

const pseudocodeRegex = /^\w99999999$/;

/**
 * Returns true if string matches pseudocode (e.g. `S99999999`)
 * @param  {string} code GSS Code to be tested
 * @return {boolean}
 */
exports.isPseudoCode = code => {
	return code.trim().match(pseudocodeRegex) !== null;
};

/**
 * Transforms map of result to a JSON object ordered by keys
 * @param  {map} map 	- Map of response object
 * @return {string}		- JSON respresentation of result
 */
const toJson = exports.toJson = map => {
	const result = Array.from(map.keys())
		.sort()
		.reduce((acc, key) => {
			acc[key] = map.get(key);
			return acc;
		}, {});
	return JSON.stringify(result, 2, 2);
};
