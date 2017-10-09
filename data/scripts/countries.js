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

const CODE_OFFSET = 0;
const VALUE_OFFSET = 3;

const transform = row => {
	const code = row[CODE_OFFSET];
	const value = row[VALUE_OFFSET];
	if (code === "CTRY12CD") return []; // Escape if header
	return [code, value];
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
