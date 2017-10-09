"use strict";

const {extract, isPseudoCode} = require("./index");

/**
 * @module DataParser/european_registers
 *
 * Writes european_registers.json to stdout
 *
 * Notes:
 * - Drop pseudocodes
 */

const CODE_OFFSET = 0;
const VALUE_OFFSET = 2;

const transform = row => {
	const code = row[CODE_OFFSET];
	const value = row[VALUE_OFFSET];
	if (code === "EER10CD") return []; // Escape if header
	if (isPseudoCode(code)) return [];
	return [code, value];
};

const configs = [
	{
		file: "EER names and codes UK as at 12_10.txt",
		transform
	}
];

extract({ configs });
