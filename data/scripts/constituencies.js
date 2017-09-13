"use strict";

const {extract, isPseudoCode} = require("./index");

/**
 * @module DataParser/constituencies
 *
 * Writes constituencies.json to stdout
 * 
 * Notes:
 * - Pseudocodes are dropped 
 * - Values need to be trimmed as some contain superfluous padding
 */


const CODE_OFFSET = 0;
const VALUE_OFFSET = 1;

const transform = row => {
	const code = row[CODE_OFFSET];
	const value = row[VALUE_OFFSET];
	if (code === "PCON14CD") return []; // Escape if header
	if (isPseudoCode(code)) return [];
	return [code, value.trim()]; 
};

const configs = [
	{
		file: "Westminster Parliamentary Constituency names and codes UK as at 12_14.txt",
		transform
	}
];

extract({ configs });
