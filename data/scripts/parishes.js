"use strict";

const {extract} = require("./index");

/**
 * @module DataParser/parishes
 *
 * Writes parishes.json to stdout
 */

const CODE_OFFSET = 0;
const VALUE_OFFSET = 1;

const transform = row => {
	const code = row[CODE_OFFSET];
	const value = row[VALUE_OFFSET];
	if (code === "PAR15CD") return []; // Escape if header
	return [code, value];
};

const configs = [
	{
		file: "Parish LAD names and codes UK as at 12_15.txt",
		transform
	}
];

extract({ configs });
