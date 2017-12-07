"use strict";

const {extract} = require("./index");

/**
 * @module DataParser/wards
 *
 * Writes wards.json to stdout
 */

const CODE_OFFSET = 0;
const VALUE_OFFSET = 1;

const transform = row => {
	const code = row[CODE_OFFSET];
	const value = row[VALUE_OFFSET];
	if (code === "WD17CD") return []; // Escape if header
	return [code, value];
};

const configs = [
	{
		file: "Ward names and codes UK as at 12_17.txt",
		transform
	}
];

extract({ configs });
