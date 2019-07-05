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
	if (value === "NUTS318NM") return []; // Escape if header
	return [code, {
		code: nutsCode,
		name: value
	}];
};

const configs = [
	{
		file: "LAU2_LAU1_NUTS_MAY_2019_UK_NSPD.csv",
		transform,
		parseOptions: {
			delimiter: ",",
		},
		encoding: "utf8",
	}
];

extract({ configs });
