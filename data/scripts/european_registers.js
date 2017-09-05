"use strict";

const {extract, toJson} = require("./index");

/**
 * @module DataParser/european_registers
 *
 * Writes european_registers.json to stdout
 */

const CODE_OFFSET = 0;
const VALUE_OFFSET = 2;

const transform = row => {
	const code = row[CODE_OFFSET];
	const value = row[VALUE_OFFSET];
	if (code === "EER10CD") return []; // Escape if header
	return [code, value];
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
