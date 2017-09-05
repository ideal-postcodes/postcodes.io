"use strict";

const {extract} = require("./index");

/**
 * @module DataParser/constituencies
 *
 * Writes constituencies.json to stdout
 * 
 * Notes:
 * - Values need to be trimmed as some contain superfluous padding
 */


const CODE_OFFSET = 0;
const VALUE_OFFSET = 1;

const transform = row => {
	const code = row[CODE_OFFSET];
	const value = row[VALUE_OFFSET];
	if (code === "PCON14CD") return []; // Escape if header
	return [code, value.trim()]; 
};

const configs = [
	{
		file: "Westminster Parliamentary Constituency names and codes UK as at 12_14.txt",
		transform
	}
];

extract({ configs });
