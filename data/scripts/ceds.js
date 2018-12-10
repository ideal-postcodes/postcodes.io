"use strict";

const { extract } = require("./index");

/**
 * @module DataParser/ceds
 *
 * Writes ceds.json to stdout
 */

const CODE_OFFSET = 0;
const VALUE_OFFSET = 1;

const edRegex = /\s+ED$/;

// Strips " ED" suffix from values
const stripSuffix = v => v.replace(edRegex, "");

const transform = row => {
	const code = row[CODE_OFFSET];
	const value = row[VALUE_OFFSET];
	if (code === "CTY10CD") return []; // Escape if header
	return [code, stripSuffix(value)];
};

const configs = [
	{
    file: "County Electoral Division names and codes EN as at 12_17.csv",
    delimiter: ",",
		transform
	}
];

extract({ configs });
