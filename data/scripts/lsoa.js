"use strict";

const {extract, isPseudoCode} = require("./index");

/**
 * @module DataParser/lsoa
 *
 * Writes lsoa.json to stdout
 * 
 * Notes:
 * - Pseudocodes are ignored
 */

const CODE_OFFSET = 0;
const VALUE_OFFSET = 1;

const transform = row => {
	const code = row[CODE_OFFSET];
	const value = row[VALUE_OFFSET];
	if (code === "LSOA11CD") return []; // Escape if header
	if (isPseudoCode(code)) return [];
	return [code, value];
};

const configs = [
	{
		file: "LSOA (2011) names and codes UK as at 12_12.txt",
		transform
	}
];

extract({ configs });
