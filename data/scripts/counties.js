"use strict";

const {extract, isPseudoCode} = require("./index");

/**
 * @module DataParser/counties
 *
 * Writes counties.json to stdout
 */

const CODE_OFFSET = 0;
const VALUE_OFFSET = 1;

const transform = row => {
	const code = row[CODE_OFFSET];
	const value = row[VALUE_OFFSET];
	if (code === "CTY10CD") return []; // Escape if header
	if (isPseudoCode(code)) return [];
	return [code, value];
};

const configs = [
	{
		file: "County names and codes UK as at 12_10.txt",
		transform
	}
];

extract({ configs });
