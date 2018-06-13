"use strict";

const {extract} = require("./index");

/**
 * @module DataParser/nuts
 *
 * Writes nuts.json to stdout
 *
 * Notes:
 * - Data extraction for nuts has the additional complexity of requiring 
 * a NUTS code. E.g.
 *
 * Nuts output: 
 * {
 * ...
 * 	"E05009046": {
 * 		"code": "UKC14",
 * 		"name": "Durham CC"
 * 	},
 * 	...
 * }
 */

const CODE_OFFSET = 0;
const NUTS_CODE_OFFSET = 4;
const VALUE_OFFSET = 5;

const transform = row => {
	const code = row[CODE_OFFSET];
	const nutsCode = row[NUTS_CODE_OFFSET];
	const value = row[VALUE_OFFSET];
	if (code === "LAU218CD") return []; // Escape if header
	return [code, {
		code: nutsCode,
		name: value
	}];
};

const configs = [
	{
		file: "LAU218_LAU118_NUTS318_NUTS218_NUTS118_UK_LU_NSPD.csv",
		transform,
		parseOptions: {
			delimiter: ",",
		},
		encoding: "utf8",
	}
];

extract({ configs });
