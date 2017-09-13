"use strict";

const {extract, isPseudoCode} = require("./index");

/**
 * @module DataParser/regions
 *
 * Writes regions.json to stdout
 * 
 * Notes:
 * - Pseudocodes are ignored
 */

const CODE_OFFSET = 0;
const VALUE_OFFSET = 2;

const transform = row => {
	const code = row[CODE_OFFSET];
	const value = row[VALUE_OFFSET];
	if (code === "GOR10CD") return []; // Escape if header
	if (isPseudoCode(code)) return [];
	return [code, value];
};

const configs = [
	{
		file: "Region names and codes EN as at 12_10 (GOR).txt",
		transform
	}
];

extract({ configs });
