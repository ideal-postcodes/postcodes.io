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
const minimist = require("minimist");

const time = (new Date()).toJSON();

/**
 * Extracts data directory from command line flag `-d`
 * @return {string} Path to data directory
 */
const extractDataDirectory = () => {
	const argv = minimist(process.argv.slice(2));
	fs.statSync(argv.d);
	return argv.d;
};

/**
 * Extracts code type `-c`, defaults to empty string
 * @return {string} Type of code to be extracted
 */
const extractCodeType = () => {
	const argv = minimist(process.argv.slice(2));
	return argv.c || "";
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
	writeToFile(toJson(result));
	console.log("ONSPD code extraction complete");
	process.exit(0);
};

/**
 * Produces file name with full path
 * @return {string} 
 */
const filePath = () => {
	const type = (extractCodeType() === "") ? "output" : extractCodeType();
	return path.join(__dirname, `${type}-${time}.json`);
};

/**
 * Writes JSON data to file specified by code (with -c flat)
 * @param  {string} result
 * @return {undefined}
 */
const writeToFile = result => {
	fs.writeFileSync(filePath(), result, { encoding: "utf8" });
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
 * @param {obeject} appendMissing 			- Manually append a object of missing key/values to output
 * @param {function} done 							- Executes when error or result completed
 * @return {undefined}
 */
exports.extract = options => {
	const {configs, appendMissing, done} = options;

	let initialCodes;
	initialCodes = (appendMissing === undefined) ? {} : appendMissing;

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

	const output = new Map(toIterable(initialCodes));

	async.each(configs, (config, next) => {
		const delimiter = config.delimiter || "	";
		const file = toFilePath(config.file);
		const transform = config.transform;
		const parseOptions = Object.assign({
			delimiter: delimiter
		}, config.parseOptions || {});
		const encoding = config.encoding || "binary";

		fs.createReadStream(file, { encoding: encoding })
		.pipe(csv.parse(parseOptions))
		.on("end", next)
		.on("error", next)
		.on("data", row => {
			if (row.join("").trim().length === 0) return;
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

/**
 * Maps an object of key/values into a iterable which can be consumed by
 * `new Map()``
 * @param  {object} sourceObject
 * @return {array}
 */
const toIterable = source => {
	return Object.keys(source).map(key => [key, source[key]]);
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
