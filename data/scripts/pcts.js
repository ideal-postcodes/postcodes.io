"use strict";

const {extract} = require("./index");

/**
 * @module DataParser/pcts
 *
 * Writes pcts.json to stdout
 */

const CODE_OFFSET = 0;
const VALUE_OFFSET = 2;

const transform = row => {
	const code = row[CODE_OFFSET];
	const value = row[VALUE_OFFSET];
	if (value === "PCTNM") return []; // Escape if header
	return [code, value];
};

const parseOptions = { delimiter: "," };

const configs = [
	{
		file: "PCT names and codes UK as at 04_19.csv",
    transform,
    parseOptions,
	}
];

extract({ configs });
