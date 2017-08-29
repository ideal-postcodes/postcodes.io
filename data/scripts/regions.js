"use strict";

const {extract, toJson, isPseudoCode} = require("./index");

/**
 * @module DataParser/regions
 *
 * Writes regions.json to stdout
 * 
 * Notes:
 * - Pseudocodes are ignored
 */

const transform = row => {
	const keyIndex = 0;
	const valueIndex = 2;
	if (row[keyIndex] === "GOR10CD") return []; // Escape if header
	if (isPseudoCode(row[keyIndex])) return [];
	return [row[keyIndex], row[valueIndex]];
};

const configs = [
	{
		file: "Region names and codes EN as at 12_10 (GOR).txt",
		transform
	}
];

extract({
	configs,
	done: (error, result) => {
		if (error) {
			console.log(error);
			process.exit(1);
		}
		console.log(toJson(result));
		process.exit(0);
	}
});
