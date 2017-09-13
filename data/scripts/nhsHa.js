"use strict";

const {extract} = require("./index");

/**
 * @module DataParser/nhsHa
 *
 * Writes nhsHa.json to stdout
 *
 * Notes:
 * - Raw TSV data is malformed and has inconsistent column counts requiring
 * `relax_column_count: true`
 */

const CODE_OFFSET = 0;
const VALUE_OFFSET = 2;

const transform = row => {
	const code = row[CODE_OFFSET];
	const value = row[VALUE_OFFSET];
	if (code === "HLTHAUCD") return []; // Escape if header
	return [code, value];
};

const parseOptions = { relax_column_count: true };

const configs = [
	{
		file: "HLTHAU names and codes UK as at 12_16 (OSHLTHAU).txt",
		transform,
		parseOptions
	}
];

extract({ configs });
