"use strict";

const {extract, toJson} = require("./index");

/**
 * @module DataParser/european_registers
 *
 * Writes european_registers.json to stdout
 */

const transform = row => {
	const keyIndex = 0;
	const valueIndex = 2;
	if (row[keyIndex] === "EER10CD") return []; // Escape if header
	return [row[keyIndex], row[valueIndex]];
};

const configs = [
	{
		file: "EER names and codes UK as at 12_10.txt",
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
