/**
 * Template file to maps source files in ONSPD to data/*.json files
 */

"use strict";

const {extract} = require("./index");

/**
 * @module DataParser/{template_code_type}
 *
 * Writes {template_code_type}.json to stdout
 */

const transform = row => {
	const keyIndex = 0;
	const valueIndex = 2;
	if (row[keyIndex] === "HEADER TO BE DETECTED") return []; // Escape if header
	return [row[keyIndex], row[valueIndex]];
};

const configs = [
	{
		file: "file name (excluding data directory path)",
		transform
	}
];

extract({ configs });
