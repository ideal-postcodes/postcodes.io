"use strict";

const {extract} = require("./index");

/**
 * @module DataParser/countries
 *
 * Writes countries.json to stdout
 * 
 * Notes:
 * - Raw TSV data is malformed and has inconsistent column counts requiring
 * `relax_column_count: true`
 */

const transform = row => {
	const keyIndex = 0;
	const valueIndex = 3;
	if (row[keyIndex] === "CTRY12CD") return []; // Escape if header
	return [row[keyIndex], row[valueIndex]];
};

const parseOptions = { relax_column_count: true };

const configs = [
	{
		file: "Country names and codes UK as at 08_12.txt",
		transform,
		parseOptions
	}
];

extract({ configs });
